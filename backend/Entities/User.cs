using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace YouTubeChannelLibrary.API.Entities;

public class User : IdentityUser<int>
{
    [Key]
    public int Id { get; set; }
    [Required]
    public string Name { get; set; } = string.Empty;
    [Required]
    public string Email { get; set; } = string.Empty;
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    [Required]
    public string Role { get; set; } = "User"; // Default role is "User"
    public string? VerificationToken { get; set; }
    public string? PasswordResetToken { get; set; }
    public DateTime? ResetTokenExpires { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
}