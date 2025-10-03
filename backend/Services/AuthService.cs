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
    private readonly IEmailService _emailService;

    public AuthService(AppDbContext context, IConfiguration configuration, IEmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
    }

    // --- Registration and Verification ---

    public async Task RegisterAsync(RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
        {
            // Use a specific, clear error message.
            throw new Exception("کاربری با این ایمیل قبلاً ثبت‌نام کرده است.");
        }

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = BCryptNet.HashPassword(dto.Password),
            // Generate a URL-safe token
            VerificationToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64))
                                    .Replace('+', '-')
                                    .Replace('/', '_')
        };

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        // --- Email Sending Logic is now inside the service ---
        var baseUrl = _configuration["FrontendSettings:BaseUrl"];
        var path = _configuration["FrontendSettings:EmailVerificationPath"];
        var verificationLink = $"{baseUrl}/{path}?token={user.VerificationToken}";

        var emailSubject = "تایید حساب کاربری";
        var emailBody = $"<div dir='rtl' style='font-family: Arial, sans-serif; text-align: right;'>" +
                        $"<h1>حساب کاربری خود را تایید کنید</h1>" +
                        $"<p>برای تایید حساب کاربری خود لطفاً روی لینک زیر کلیک کنید:</p>" +
                        $"<a href='{verificationLink}' style='padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;'>تایید ایمیل</a>" +
                        $"</div>";

        await _emailService.SendEmailAsync(user.Email, emailSubject, emailBody);
    }

    public async Task<bool> VerifyEmailAsync(string token)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.VerificationToken == token);
        if (user == null || user.EmailConfirmed)
        {
            return false;
        }

        user.EmailConfirmed = true;
        user.VerificationToken = null; // Token should be single-use
        await _context.SaveChangesAsync();
        return true;
    }

    // --- Password Reset Flow ---

    public async Task ForgotPasswordAsync(string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            // Do not reveal that the user does not exist. Return silently.
            return;
        }

        user.PasswordResetToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64))
                                        .Replace('+', '-')
                                        .Replace('/', '_');
        user.ResetTokenExpires = DateTime.UtcNow.AddHours(1); // Token is valid for 1 hour
        await _context.SaveChangesAsync();

        // --- Email Sending Logic for Password Reset ---
        var baseUrl = _configuration["FrontendSettings:BaseUrl"];
        var path = _configuration["FrontendSettings:PasswordResetPath"];
        // Use the correct route format for the frontend (e.g., /reset-password/TOKEN)
        var resetLink = $"{baseUrl}/{path}/{user.PasswordResetToken}";

        var emailSubject = "بازیابی رمز عبور";
        var emailBody = $"<div dir='rtl' style='font-family: Arial, sans-serif; text-align: right;'>" +
                        $"<h1>بازیابی رمز عبور</h1>" +
                        $"<p>برای بازیابی رمز عبور خود لطفاً روی لینک زیر کلیک کنید:</p>" +
                        $"<a href='{resetLink}' style='padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;'>بازیابی رمز عبور</a>" +
                        $"</div>";

        await _emailService.SendEmailAsync(user.Email, emailSubject, emailBody);
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(
            u => u.PasswordResetToken == dto.Token && u.ResetTokenExpires > DateTime.UtcNow);

        if (user == null)
        {
            // Invalid or expired token
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
        if (!user.EmailConfirmed)
        {
            throw new Exception("حساب کاربری شما فعال نشده است. لطفاً ایمیل خود را برای لینک فعال‌سازی بررسی کنید.");
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
            expires: DateTime.Now.AddMinutes(15), // Short-lived access token
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }
}