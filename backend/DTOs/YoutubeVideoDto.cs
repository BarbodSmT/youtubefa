namespace YouTubeChannelLibrary.API.DTOs
{
    public class YouTubeVideoDto
    {
        public string? Id { get; set; }
        public string? Title { get; set; }
        public string? ThumbnailUrl { get; set; }
        public DateTime? PublishedAt { get; set; }
    }
}