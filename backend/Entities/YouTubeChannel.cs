using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YouTubeChannelLibrary.API.Entities;
namespace YouTubeChannelLibrary.API.Entities;

public class YouTubeChannel
{
    [Key]
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ChannelUrl { get; set; } = string.Empty;
    public DateTime PublishedAt { get; set; }
    public string Avatar { get; set; } = string.Empty;
    public string? BannerImage { get; set; }
    public long SubscriberCount { get; set; }
    public long VideoCount { get; set; }
    public long ViewCount { get; set; }
    public List<string>? Tags { get; set; }
    public DateTime LastUpdatedAt { get; set; } = DateTime.UtcNow;

    public int CategoryId { get; set; }
    [ForeignKey("CategoryId")]
    public Category? Category { get; set; }
    [NotMapped]
    public List<YouTubeVideo> RecentVideos { get; set; } = new List<YouTubeVideo>();
}