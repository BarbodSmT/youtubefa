using System.ComponentModel.DataAnnotations;
namespace YouTubeChannelLibrary.API.Entities;

public class Category
{
    [Key]
    public int Id { get; set; }
    [Required]
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}