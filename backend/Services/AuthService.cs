using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using YouTubeChannelLibrary.API.Data;
using YouTubeChannelLibrary.API.DTOs;
using YouTubeChannelLibrary.API.Entities;
using BCryptNet = BCrypt.Net.BCrypt;

namespace YouTubeChannelLibrary.API.Services;

public class AuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    // --- Registration (Email verification disabled) ---
    public async Task RegisterAsync(RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
        {
            throw new Exception("کاربری با این ایمیل قبلاً ثبت‌نام کرده است.");
        }

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = BCryptNet.HashPassword(dto.Password),
            EmailConfirmed = true,  // Auto-confirm since we don't have email
            VerificationToken = null,
            Role = "User"  // Default role
        };

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
    }

    // --- Password Reset (Disabled without email) ---
    public async Task ForgotPasswordAsync(string email)
    {
        // Without email service, we can't send reset links
        // For now, admins will need to reset passwords manually
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            // Don't reveal that user doesn't exist
            return;
        }

        // Generate token but can't send it
        user.PasswordResetToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64))
                                        .Replace('+', '-')
                                        .Replace('/', '_');
        user.ResetTokenExpires = DateTime.UtcNow.AddHours(1);
        await _context.SaveChangesAsync();

        // TODO: Log the reset token for admin to manually send
        // Or display it in the response (not secure but works without email)
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(
            u => u.PasswordResetToken == dto.Token && u.ResetTokenExpires > DateTime.UtcNow);

        if (user == null)
        {
            return false;
        }

        user.PasswordHash = BCryptNet.HashPassword(dto.Password);
        user.PasswordResetToken = null;
        user.ResetTokenExpires = null;

        await _context.SaveChangesAsync();
        return true;
    }

    // --- Login and Token Generation ---
    public async Task<(AuthResponseDto authResponse, string? refreshToken)> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null || !BCryptNet.Verify(dto.Password, user.PasswordHash))
        {
            throw new Exception("ایمیل یا رمز عبور اشتباه است.");
        }

        // Check if email is confirmed (always true now)
        if (!user.EmailConfirmed)
        {
            throw new Exception("لطفاً ابتدا ایمیل خود را تایید کنید.");
        }

        var accessToken = CreateJwtToken(user);
        var refreshToken = dto.RememberMe ? GenerateRefreshToken() : null;

        if (dto.RememberMe && refreshToken != null)
        {
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _context.SaveChangesAsync();
        }

        var userDto = new UserDto { Id = user.Id, Name = user.Name, Email = user.Email, Role = user.Role };
        return (new AuthResponseDto { User = userDto, Token = accessToken }, refreshToken);
    }

    private string CreateJwtToken(User user)
    {
        var jwtSecret = _configuration["AppSettings:JwtSecret"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.Now.AddHours(24),  // Extended to 24 hours
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }
}