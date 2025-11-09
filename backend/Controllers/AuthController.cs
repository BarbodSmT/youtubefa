using Microsoft.AspNetCore.Mvc;
using YouTubeChannelLibrary.API.Data;
using YouTubeChannelLibrary.API.Common;
using YouTubeChannelLibrary.API.DTOs;
using YouTubeChannelLibrary.API.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace YouTubeChannelLibrary.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly AppDbContext _context; // 2. Add a private field for the DbContext

    // 3. Inject both AuthService and AppDbContext in the constructor
    public AuthController(AuthService authService, AppDbContext context)
    {
        _authService = authService;
        _context = context;
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse>> Register(RegisterDto dto)
    {
        try
        {
            await _authService.RegisterAsync(dto);
            return Ok(ApiResponse.Success("ثبت نام با موفقیت انجام شد. لطفا ایمیل خود را برای فعال سازی حساب بررسی کنید."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<UserDto>.Fail(ex.Message));
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login(LoginDto dto)
    {
        try
        {
            var (authResponse, refreshToken) = await _authService.LoginAsync(dto);

            if (dto.RememberMe && !string.IsNullOrEmpty(refreshToken))
            {
                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true, // Prevents client-side script access
                    Expires = DateTime.UtcNow.AddDays(7),
                    IsEssential = true,
                    SameSite = SameSiteMode.Strict
                };
                Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
            }

            return Ok(ApiResponse<AuthResponseDto>.Success(authResponse));
        }
        catch (Exception ex)
        {
            return Unauthorized(ApiResponse<AuthResponseDto>.Fail(ex.Message, 401));
        }
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult<ApiResponse<object>>> ForgotPassword(ForgotPasswordDto dto)
    {
        await _authService.ForgotPasswordAsync(dto.Email);
        // Always return a success message to prevent email enumeration attacks
        return Ok(ApiResponse<object>.Success("اگر ایمیل شما در سیستم موجود باشد، لینک بازیابی رمز عبور برایتان ارسال خواهد شد."));
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<ApiResponse<object>>> ResetPassword(ResetPasswordDto dto)
    {
        var success = await _authService.ResetPasswordAsync(dto);
        if (!success)
        {
            return BadRequest(ApiResponse<object>.Fail("لینک بازیابی نامعتبر یا منقضی شده است."));
        }
        return Ok(ApiResponse<object>.Success("رمز عبور شما با موفقیت تغییر کرد."));
    }
    [HttpGet("me")]
    [Authorize] // This endpoint is protected and requires a valid token
    public async Task<ActionResult<ApiResponse<UserDto>>> GetCurrentUser()
    {
        // Get the user ID from the claims embedded in the JWT token
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized(ApiResponse.Fail("توکن نامعتبر.", 401));
        }

        var user = await _context.Users.FindAsync(int.Parse(userId));
        if (user == null)
        {
            return NotFound(ApiResponse.Fail("کاربر یافت نشد.", 404));
        }

        var userDto = new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role
        };

        return Ok(ApiResponse<UserDto>.Success(userDto));
    }
}