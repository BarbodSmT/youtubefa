using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YouTubeChannelLibrary.API.Entities
{
    public class YouTubeVideo
    {
        [Key]
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string ThumbnailUrl { get; set; } = string.Empty;
        public DateTime PublishedAt { get; set; }

        [ForeignKey("YouTubeChannel")]
        public string ChannelId { get; set; } = string.Empty;
        public YouTubeChannel YouTubeChannel { get; set; } = null!;
    }
}