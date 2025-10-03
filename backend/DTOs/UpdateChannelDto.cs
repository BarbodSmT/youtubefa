using System.ComponentModel.DataAnnotations;
using YouTubeChannelLibrary.API.Common;

namespace YouTubeChannelLibrary.API.DTOs;

public class UpdateChannelDto
{
    // A private backing field for the property
    private string _title = string.Empty;

    [Required(ErrorMessage = "عنوان کانال اجباری است")]
    public string Title 
    { 
        get => _title;
        // The 'set' accessor automatically cleans the input string
        set => _title = value.CleanString(); 
    }
    
    public string Description { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "انتخاب دسته بندی اجباری است")]
    public int CategoryId { get; set; }

    public List<string>? Tags { get; set; }
}