using Microsoft.EntityFrameworkCore;
using YouTubeChannelLibrary.API.Data;
using YouTubeChannelLibrary.API.Entities;
using YouTubeChannelLibrary.API.DTOs;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace YouTubeChannelLibrary.API.Services;

public class SubmissionService
{
    private readonly AppDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<SubmissionService> _logger;
    private readonly string _apiKey;

    public SubmissionService(AppDbContext context, IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<SubmissionService> logger)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _apiKey = configuration["YouTubeApiKey"];
    }

    public async Task<(bool Success, string Message, YouTubeChannel? Channel)> ApproveSubmissionAsync(int submissionId)
    {
        var submission = await _context.Submissions.FindAsync(submissionId);
        if (submission == null)
        {
            return (false, "درخواست یافت نشد.", null);
        }

        try
        {
            var channelInfo = await FetchYouTubeChannelInfo(submission.ChannelUrl);
            if (channelInfo == null)
            {
                return (false, "خطا در بارگذاری اطلاعات از یوتیوب.", null);
            }

            // Check if channel already exists
            if (await _context.Channels.AnyAsync(c => c.Id == channelInfo.Id))
            {
                submission.Status = "Rejected";
                await _context.SaveChangesAsync();
                return (false, "این کانال قبلا ثبت شده است.", null);
            }

            var newChannel = new YouTubeChannel
            {
                Id = channelInfo.Id,
                Title = channelInfo.Title,
                Description = channelInfo.Description,
                PublishedAt = channelInfo.PublishedAt,
                Avatar = channelInfo.Avatar,
                SubscriberCount = channelInfo.SubscriberCount,
                VideoCount = channelInfo.VideoCount,
                ViewCount = channelInfo.ViewCount,
                Tags = channelInfo.Tags,
                BannerImage = channelInfo.BannerImage,
                ChannelUrl = $"https://www.youtube.com/channel/{channelInfo.Id}",
                CategoryId = submission.CategoryId,
                LastUpdatedAt = DateTime.UtcNow
            };

            await _context.Channels.AddAsync(newChannel);
            submission.Status = "Approved";

            await _context.SaveChangesAsync();
            return (true, "درخواست تایید شد.", newChannel);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطا در تایید درخواست {SubmissionId}", submissionId);
            return (false, $"خطا در تایید درخواست: {ex.Message}", null);
        }
    }

    private async Task<YouTubeChannel?> FetchYouTubeChannelInfo(string channelUrl)
    {
        var identifier = GetIdentifierFromUrl(channelUrl);
        if (string.IsNullOrEmpty(identifier)) return null;

        string? channelId = null;

        // If the identifier looks like a modern handle or legacy name, search for it.
        if (!identifier.StartsWith("UC"))
        {
            channelId = await GetChannelIdFromSearch(identifier);
            if (string.IsNullOrEmpty(channelId))
            {
                _logger.LogWarning("Could not resolve identifier '{Identifier}' to a YouTube Channel ID.", identifier);
                return null; // Could not find the channel by its handle/name
            }
        }
        else
        {
            // It's already a canonical channel ID.
            channelId = identifier;
        }

        var httpClient = _httpClientFactory.CreateClient();
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
            if (!doc.RootElement.TryGetProperty("items", out var items) || items.GetArrayLength() == 0) return null;

            var item = items[0];

            var snippet = item.TryGetProperty("snippet", out var s) ? s : default;
            var statistics = item.TryGetProperty("statistics", out var st) ? st : default;
            var branding = item.TryGetProperty("brandingSettings", out var b) ? b : default;

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

    private async Task<string?> GetChannelIdFromSearch(string handleOrName)
    {
        var httpClient = _httpClientFactory.CreateClient();

        var encodedIdentifier = Uri.EscapeDataString(handleOrName);
        var searchUrl = $"https://www.googleapis.com/youtube/v3/search?part=snippet&q={encodedIdentifier}&type=channel&key={_apiKey}";
        
        _logger.LogInformation("Calling YouTube Search API with URL: {SearchUrl}", searchUrl);

        var response = await httpClient.GetAsync(searchUrl);
        var json = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("YouTube Search API failed with status {StatusCode}. Response: {JsonResponse}", response.StatusCode, json);
            return null;
        }

        _logger.LogInformation("YouTube Search API response: {JsonResponse}", json);

        using var doc = JsonDocument.Parse(json);
        if (doc.RootElement.TryGetProperty("items", out var items) && items.GetArrayLength() > 0)
        {
            return GetString(items[0].GetProperty("snippet"), "channelId");
        }

        _logger.LogWarning("YouTube Search API returned no results for identifier: {Identifier}", handleOrName);
        return null;
    }

    private string GetIdentifierFromUrl(string url)
    {
        try
        {
            var uri = new Uri(url);
            var segment = uri.Segments.LastOrDefault();
            return segment?.Trim('/') ?? "";
        }
        catch
        {
            return url;
        }
    }
    public async Task<Submission> CreateSubmissionAsync(CreateSubmissionDto dto, string email)
    {
        // Optional: Check if the channel URL has already been submitted or approved
        var existingSubmission = await _context.Submissions.FirstOrDefaultAsync(s => s.ChannelUrl == dto.ChannelUrl);
        var existingChannel = await _context.Channels.FirstOrDefaultAsync(c => c.ChannelUrl == dto.ChannelUrl);

        if (existingSubmission != null || existingChannel != null)
        {
            throw new Exception("این کانال قبلا ثبت شده یا در انتظار تایید است.");
        }

        var submission = new Submission
        {
            ChannelUrl = dto.ChannelUrl,
            CategoryId = dto.CategoryId,
            SubmittedByEmail = dto.SubmittedByEmail,
            Status = "Pending",
            SubmittedAt = DateTime.UtcNow
        };

        await _context.Submissions.AddAsync(submission);
        await _context.SaveChangesAsync();
        return submission;
    }

    // --- NEW METHOD ---
    public async Task<bool> DeleteSubmissionAsync(int submissionId)
    {
        var submission = await _context.Submissions.FindAsync(submissionId);
        if (submission == null)
        {
            return false; // Submission not found
        }

        _context.Submissions.Remove(submission);
        await _context.SaveChangesAsync();
        return true;
    }

    private string? ExtractChannelIdFromUrl(string url)
    {
        var match = Regex.Match(url, @"youtube\.com\/(?:channel\/|c\/|@|user\/)([\w-]+)");
        return match.Success ? match.Groups[1].Value : null;
    }
    private string GetString(JsonElement element, string propertyName)
    {
            if (element.ValueKind != JsonValueKind.Object) return "";
        return element.TryGetProperty(propertyName, out var prop) && prop.ValueKind == JsonValueKind.String ? prop.GetString() ?? "" : "";
    }

    private long GetLong(JsonElement element, string propertyName)
    {
        if (element.ValueKind != JsonValueKind.Object) return 0;
        if (element.TryGetProperty(propertyName, out var prop) && prop.ValueKind == JsonValueKind.String && long.TryParse(prop.GetString(), out var result))
            return result;
        return 0;
    }

    private DateTime GetDateTime(JsonElement element, string propertyName)
    {
        if (element.ValueKind != JsonValueKind.Object) return DateTime.MinValue;
        return element.TryGetProperty(propertyName, out var prop) && prop.TryGetDateTime(out var result) ? result : DateTime.MinValue;
    }

    private System.Collections.Generic.List<string> GetTags(JsonElement branding, string propertyName)
    {
        if (branding.ValueKind != JsonValueKind.Object) return new System.Collections.Generic.List<string>();
        if (branding.TryGetProperty("channel", out var channel))
        {
            var keywords = GetString(channel, propertyName);
            if (!string.IsNullOrEmpty(keywords))
            {
                return keywords.Split(new[] { '\"', ' ' }, StringSplitOptions.RemoveEmptyEntries).ToList();
            }
        }
        return new System.Collections.Generic.List<string>();
    }
    
}