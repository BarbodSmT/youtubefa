using System;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore; // This is the required using directive for ToListAsync
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using YouTubeChannelLibrary.API.Data;
using YouTubeChannelLibrary.API.Entities;
using Microsoft.Extensions.Configuration;

namespace YouTubeChannelLibrary.API.Services
{
    // Inherit from BackgroundService to correctly implement IHostedService
    public class YouTubeUpdateService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<YouTubeUpdateService> _logger;
        private readonly string _apiKey;

        public YouTubeUpdateService(IServiceProvider serviceProvider, ILogger<YouTubeUpdateService> logger, IConfiguration configuration)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _apiKey = configuration["YouTubeApiKey"];
        }

        // Override the ExecuteAsync method from the BackgroundService base class
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("YouTube Update Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("YouTube Update Service is running at: {time}", DateTimeOffset.Now);
                await UpdateAllChannelsAndVideos(stoppingToken);
                
                // Wait for 24 hours before running again
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }

        private async Task UpdateAllChannelsAndVideos(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Starting to update all channels and videos from YouTube API.");

            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var httpClientFactory = scope.ServiceProvider.GetRequiredService<IHttpClientFactory>();
            
            var channels = await context.Channels.ToListAsync(stoppingToken);

            foreach (var channel in channels)
            {
                if (stoppingToken.IsCancellationRequested) break;

                try
                {
                    _logger.LogInformation("Updating channel: {ChannelTitle}", channel.Title);

                    var httpClient = httpClientFactory.CreateClient();
                    var channelInfo = await FetchYouTubeChannelInfo(httpClient, channel.Id);
                    if (channelInfo != null)
                    {
                        // Update channel properties
                        channel.Title = channelInfo.Title;
                        channel.Description = channelInfo.Description;
                        channel.SubscriberCount = channelInfo.SubscriberCount;
                        channel.VideoCount = channelInfo.VideoCount;
                        channel.ViewCount = channelInfo.ViewCount;
                        channel.LastUpdatedAt = DateTime.UtcNow;

                        // Fetch and update recent videos
                        var recentVideos = await FetchRecentVideos(httpClient, channel.Id);
                        
                        // Remove old videos for this channel
                        var existingVideos = context.YouTubeVideos.Where(v => v.ChannelId == channel.Id);
                        context.YouTubeVideos.RemoveRange(existingVideos);
                        
                        // Add new videos
                        channel.RecentVideos = recentVideos;
                    }
                    await Task.Delay(1000, stoppingToken); // Small delay to avoid hitting API rate limits too quickly
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to update channel {ChannelId}", channel.Id);
                }
            }
            
            await context.SaveChangesAsync(stoppingToken);
            _logger.LogInformation("Finished updating all channels and videos.");
        }

        private async Task<YouTubeChannel?> FetchYouTubeChannelInfo(HttpClient httpClient, string channelId)
        {
            var url = $"https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id={channelId}&key={_apiKey}";
            var response = await httpClient.GetAsync(url);

            var json = await response.Content.ReadAsStringAsync();
            
            _logger.LogInformation("Raw YouTube API response for channel {ChannelId}: {JsonResponse}", channelId, json);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("YouTube API returned an error for channel {ChannelId}: {Error}", channelId, json);
                return null;
            }
            
            try
            {
                using var doc = JsonDocument.Parse(json);
                
                if (!doc.RootElement.TryGetProperty("items", out var items) || items.GetArrayLength() == 0)
                {
                    _logger.LogWarning("YouTube API response for channel {ChannelId} contained no items.", channelId);
                    return null;
                }

                var item = items[0];
                
                var snippet = item.TryGetProperty("snippet", out var s) ? s : default;
                var statistics = item.TryGetProperty("statistics", out var st) ? st : default;
                var branding = item.TryGetProperty("brandingSettings", out var b) ? b : default;

                // Safely parse nested properties
                string avatarUrl = "";
                if (snippet.ValueKind == JsonValueKind.Object && snippet.TryGetProperty("thumbnails", out var thumbnails) && thumbnails.TryGetProperty("default", out var defaultThumbnail))
                {
                    avatarUrl = GetString(defaultThumbnail, "url");
                }

                string bannerUrl = "";
                if (branding.ValueKind == JsonValueKind.Object && branding.TryGetProperty("image", out var image))
                {
                    bannerUrl = GetString(image, "bannerExternalUrl");
                }

                return new YouTubeChannel
                {
                    Id = GetString(item, "id"),
                    Title = GetString(snippet, "title"),
                    Description = GetString(snippet, "description"),
                    PublishedAt = GetDateTime(snippet, "publishedAt"),
                    Avatar = avatarUrl,
                    SubscriberCount = GetLong(statistics, "subscriberCount"),
                    VideoCount = GetLong(statistics, "videoCount"),
                    ViewCount = GetLong(statistics, "viewCount"),
                    Tags = GetTags(branding, "keywords"),
                    BannerImage = bannerUrl
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse YouTube API JSON for channel {ChannelId}. Raw JSON: {JsonResponse}", channelId, json);
                return null;
            }
        }

        private async Task<List<YouTubeVideo>> FetchRecentVideos(HttpClient httpClient, string channelId)
        {
            var videos = new List<YouTubeVideo>();
            var searchUrl = $"https://www.googleapis.com/youtube/v3/search?part=snippet&channelId={channelId}&maxResults=5&order=date&type=video&key={_apiKey}";
            
            var searchResponse = await httpClient.GetAsync(searchUrl);
            if (!searchResponse.IsSuccessStatusCode) return videos;

            var searchJson = await searchResponse.Content.ReadAsStringAsync();
            using var searchDoc = JsonDocument.Parse(searchJson);
            
            var videoIds = searchDoc.RootElement.GetProperty("items").EnumerateArray()
                .Select(item => GetString(item.GetProperty("id"), "videoId"))
                .Where(id => !string.IsNullOrEmpty(id))
                .ToList();

            if (!videoIds.Any()) return videos;

            var videoDetailsUrl = $"https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id={string.Join(",", videoIds)}&key={_apiKey}";
            var detailsResponse = await httpClient.GetAsync(videoDetailsUrl);
            if (!detailsResponse.IsSuccessStatusCode) return videos;
            
            var detailsJson = await detailsResponse.Content.ReadAsStringAsync();
            using var detailsDoc = JsonDocument.Parse(detailsJson);

            foreach (var item in detailsDoc.RootElement.GetProperty("items").EnumerateArray())
            {
                videos.Add(new YouTubeVideo
                {
                    Id = GetString(item, "id"),
                    Title = GetString(item.GetProperty("snippet"), "title"),
                    ThumbnailUrl = GetString(item.GetProperty("snippet").GetProperty("thumbnails").GetProperty("default"), "url"),
                    PublishedAt = GetDateTime(item.GetProperty("snippet"), "publishedAt"),
                    ChannelId = channelId
                });
            }
            return videos;
        }

        private string GetString(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var prop) && prop.ValueKind == JsonValueKind.String ? prop.GetString() ?? "" : "";
        }

        private long GetLong(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var prop) && long.TryParse(prop.GetString(), out var result) ? result : 0;
        }

        private DateTime GetDateTime(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var prop) && prop.TryGetDateTime(out var result) ? result : DateTime.MinValue;
        }
        
        private List<string> GetTags(JsonElement branding, string propertyName)
        {
            var keywords = GetString(branding.GetProperty("channel"), propertyName);
            return keywords.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).ToList();
        }
    }
}

