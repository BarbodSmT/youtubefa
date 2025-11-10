using Microsoft.EntityFrameworkCore;
using YouTubeChannelLibrary.API.Data;
using YouTubeChannelLibrary.API.DTOs;
using YouTubeChannelLibrary.API.Entities;

namespace YouTubeChannelLibrary.API.Services
{
    public class ChannelService
    {
        private readonly AppDbContext _context;

        public ChannelService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<YouTubeChannel?> GetChannelWithRecentVideosAsync(string id)
        {
            var channel = await _context.Channels
                .Include(c => c.Category)
                .Include(c => c.RecentVideos)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (channel != null && channel.RecentVideos != null)
            {
                channel.RecentVideos = channel.RecentVideos
                    .OrderByDescending(v => v.PublishedAt)
                    .Take(12)
                    .ToList();
            }

            return channel;
        }

        public async Task<YouTubeChannel?> UpdateChannelAsync(string id, UpdateChannelDto dto)
        {
            var channel = await _context.Channels.FindAsync(id);
            if (channel == null) return null;

            channel.Title = dto.Title;
            channel.Description = dto.Description;
            channel.CategoryId = dto.CategoryId;
            channel.Tags = dto.Tags;
            channel.LastUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return channel;
        }

        public async Task<bool> DeleteChannelAsync(string id)
        {
            var channel = await _context.Channels.FindAsync(id);
            if (channel == null) return false;

            _context.Channels.Remove(channel);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

