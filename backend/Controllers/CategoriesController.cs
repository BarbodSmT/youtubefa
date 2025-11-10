using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YouTubeChannelLibrary.API.Common;
using YouTubeChannelLibrary.API.Data;
using YouTubeChannelLibrary.API.DTOs;
using YouTubeChannelLibrary.API.Entities;
using System.Linq;

namespace YouTubeChannelLibrary.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Categories - Publicly accessible
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<Category>>>> GetCategories()
        {
            var categories = await _context.Categories.ToListAsync();
            return Ok(ApiResponse<IEnumerable<Category>>.Success(categories));
        }

        // GET: api/Categories/{id} - Publicly accessible
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<Category>>> GetCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return NotFound(ApiResponse<Category>.Fail("دسته بندی یافت نشد.", 404));
            }

            return Ok(ApiResponse<Category>.Success(category));
        }

        // POST: api/Categories - Admin only
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<Category>>> CreateCategory(CategoryDto categoryDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                var errorMessage = string.Join(" | ", errors);
                return BadRequest(ApiResponse<object>.Fail(errorMessage));
            }

            var category = new Category
            {
                Name = categoryDto.Name,
                Icon = categoryDto.Icon,
                Color = categoryDto.Color
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, ApiResponse<Category>.Success(category, "دسته بندی با موفقیت ایجاد شد."));
        }

        // PUT: api/Categories/{id} - Admin only
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<Category>>> UpdateCategory(int id, CategoryDto categoryDto)
        {
            if (id != categoryDto.Id)
            {
                return BadRequest(ApiResponse<object>.Fail("شناسه دسته بندی مطابقت ندارد."));
            }
            
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                var errorMessage = string.Join(" | ", errors);
                return BadRequest(ApiResponse<object>.Fail(errorMessage));
            }

            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return NotFound(ApiResponse<Category>.Fail("دسته بندی یافت نشد.", 404));
            }

            category.Name = categoryDto.Name;
            category.Icon = categoryDto.Icon;
            category.Color = categoryDto.Color;

            _context.Entry(category).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CategoryExists(id))
                {
                    return NotFound(ApiResponse<Category>.Fail("دسته بندی یافت نشد.", 404));
                }
                else
                {
                    throw;
                }
            }

            return Ok(ApiResponse<Category>.Success(category, "دسته بندی با موفقیت بروزرسانی شد."));
        }

        // DELETE: api/Categories/{id} - Admin only
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<object>>> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound(ApiResponse<object>.Fail("دسته بندی یافت نشد.", 404));
            }

            // Prevent deletion if the category is in use
            var isCategoryInUse = await _context.Channels.AnyAsync(c => c.CategoryId == id);
            if (isCategoryInUse)
            {
                return BadRequest(ApiResponse<object>.Fail("این دسته بندی توسط یک یا چند کانال در حال استفاده است و قابل حذف نیست."));
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.Success("دسته بندی با موفقیت حذف شد."));
        }

        private bool CategoryExists(int id)
        {
            return _context.Categories.Any(e => e.Id == id);
        }
    }
}

