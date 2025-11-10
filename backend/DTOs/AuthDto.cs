using System.ComponentModel.DataAnnotations;
using YouTubeChannelLibrary.API.Common;

namespace YouTubeChannelLibrary.API.DTOs;

public class RegisterDto
{
    private string _name = string.Empty;
    [Required(ErrorMessage = "نام اجباری است")]
    public string Name
    {
        get => _name;
        set => _name = value.CleanString();
    }

    [Required(ErrorMessage = "ایمیل اجباری است"), EmailAddress(ErrorMessage = "ایمیل معتبر نیست")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "رمز عبور اجباری است")]
    [MinLength(6, ErrorMessage = "رمز عبور باید حداقل ۶ کاراکتر باشد")]
    public string Password { get; set; } = string.Empty;
}

public class LoginDto
{
    [Required(ErrorMessage = "ایمیل اجباری است")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "رمز عبور اجباری است")]
    public string Password { get; set; } = string.Empty;

    public bool RememberMe { get; set; } = false;
}

public class ForgotPasswordDto
{
    [Required(ErrorMessage = "ایمیل اجباری است")]
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordDto
{
    [Required]
    public string Token { get; set; } = string.Empty;
    [Required, MinLength(6, ErrorMessage = "رمز عبور باید حداقل ۶ کاراکتر باشد")]
    public string Password { get; set; } = string.Empty;
}

public class UserDto
{
    private string _name = string.Empty;
    public int Id { get; set; }
        public string Name
    {
        get => _name;
        set => _name = value.CleanString();
    }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public UserDto User { get; set; } = null!;
    public string Token { get; set; } = string.Empty;
    // The refresh token will be sent in a secure cookie, not in the response body.
}