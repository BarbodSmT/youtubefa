using System.ComponentModel.DataAnnotations;

namespace YouTubeChannelLibrary.API.DTOs
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public string? Color { get; set; }
    }

    public class CreateCategoryDto
    {
        [Required(ErrorMessage = "نام دسته‌بندی اجباری است.")]
        public string Name { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public string? Color { get; set; }
    }

    public class UpdateCategoryDto
    {
        [Required(ErrorMessage = "نام دسته‌بندی اجباری است.")]
        public string Name { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public string? Color { get; set; }
    }
}