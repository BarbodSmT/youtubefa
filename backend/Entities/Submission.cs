using System.ComponentModel.DataAnnotations;
namespace YouTubeChannelLibrary.API.Entities;

public class Submission
{
    [Key]
    public int Id { get; set; }
    [Required]
    public string ChannelUrl { get; set; } = string.Empty;
    public string? SubmittedByEmail { get; set; }
    public int CategoryId { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Pending";
}