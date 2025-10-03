using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YouTubeChannelLibrary.API.Common;
using YouTubeChannelLibrary.API.Data;
using YouTubeChannelLibrary.API.DTOs;
using YouTubeChannelLibrary.API.Entities;
using YouTubeChannelLibrary.API.Services;

[ApiController]
[Route("api/[controller]")]
public class ChannelsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ChannelService _channelService;

    public ChannelsController(AppDbContext context, ChannelService channelService)
    {
        _context = context;
        _channelService = channelService;
    }

    // --- PUBLIC ENDPOINTS ---

    [HttpGet]
    public async Task<ActionResult<ApiResponse<object>>> GetApprovedChannels()
    {
        var channels = await _context.Channels
            .Include(c => c.Category) // Include category data
            .OrderByDescending(c => c.SubscriberCount)
            .ToListAsync();
            
        var lastUpdated = channels.Any() ? channels.Max(c => c.LastUpdatedAt) : DateTime.UtcNow;
        
        return Ok(ApiResponse<object>.Success(new { channels, lastUpdated }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<YouTubeChannel>>> GetChannelById(string id)
    {
        var channel = await _channelService.GetChannelWithRecentVideosAsync(id);
        if (channel == null)
        {
            return NotFound(ApiResponse<YouTubeChannel>.Fail("کانال مورد نظر یافت نشد.", 404));
        }
        return Ok(ApiResponse<YouTubeChannel>.Success(channel));
    }

    // --- ADMIN-ONLY CRUD ENDPOINTS ---

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<YouTubeChannel>>> UpdateChannel(string id, UpdateChannelDto dto)
    {
        try
        {
            var updatedChannel = await _channelService.UpdateChannelAsync(id, dto);
            if (updatedChannel == null)
            {
                return NotFound(ApiResponse<YouTubeChannel>.Fail("کانال مورد نظر یافت نشد.", 404));
            }
            return Ok(ApiResponse<YouTubeChannel>.Success(updatedChannel, "کانال با موفقیت بروزرسانی شد."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<YouTubeChannel>.Fail(ex.Message));
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteChannel(string id)
    {
        var success = await _channelService.DeleteChannelAsync(id);
        if (!success)
        {
            return NotFound(ApiResponse<object>.Fail("کانال مورد نظر یافت نشد.", 404));
        }
        return Ok(ApiResponse<object>.Success("کانال با موفقیت حذف شد."));
    }
}