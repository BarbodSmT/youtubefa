using System.ComponentModel.DataAnnotations;
using YouTubeChannelLibrary.API.Common;

namespace YouTubeChannelLibrary.API.DTOs;

public class CreateSubmissionDto
{
    private string _channelUrl = string.Empty;

    [Required(ErrorMessage = "لینک کانال یوتیوب اجباری است")]
    [Url(ErrorMessage = "لینک وارد شده معتبر نیست")]
    public string ChannelUrl 
    { 
        get => _channelUrl;
        set => _channelUrl = value.CleanString(); // Automatically clean the URL
    }

    [Required(ErrorMessage = "انتخاب دسته بندی اجباری است")]
    public int CategoryId { get; set; }

    // This can be nullable if submissions can be anonymous
    public string? SubmittedByEmail { get; set; }
}