using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using YouTubeChannelLibrary.API.Common;
using YouTubeChannelLibrary.API.Data;
using YouTubeChannelLibrary.API.DTOs;
using YouTubeChannelLibrary.API.Services;
using YouTubeChannelLibrary.API.Entities;

[ApiController]
[Route("api/[controller]")]
public class SubmissionsController : ControllerBase
{
    private readonly SubmissionService _submissionService;
    private readonly AppDbContext _context;

    public SubmissionsController(SubmissionService submissionService, AppDbContext context)
    {
        _submissionService = submissionService;
        _context = context;
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ApiResponse<Submission>>> CreateSubmission([FromBody] CreateSubmissionDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors)
                                        .Select(e => e.ErrorMessage)
                                        .ToList();
            return BadRequest(ApiResponse<Submission>.Fail(string.Join(", ", errors), 400));
        }
        
        var userEmail = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "anonymous@example.com";
        try
        {
            var submission = await _submissionService.CreateSubmissionAsync(dto, userEmail);
            return Ok(ApiResponse<Submission>.Success(submission, "درخواست شما با موفقیت ثبت شد و پس از بررسی، به لیست اضافه خواهد شد."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<Submission>.Fail(ex.Message));
        }
    }
    
    [HttpGet("pending")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<Submission>>>> GetPendingSubmissions()
    {
        var submissions = await _context.Submissions
            .Where(s => s.Status == "Pending")
            .OrderByDescending(s => s.SubmittedAt)
            .ToListAsync();
        return Ok(ApiResponse<IEnumerable<Submission>>.Success(submissions));
    }

    [HttpPost("{id}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<YouTubeChannel>>> ApproveSubmission(int id)
    {
        try
        {
            var channel = await _submissionService.ApproveSubmissionAsync(id);
            return Ok(ApiResponse<YouTubeChannel>.Success("درخواست با موفقیت تایید شد."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<YouTubeChannel>.Fail(ex.Message));
        }
    }

    [HttpPost("{id}/reject")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> RejectSubmission(int id)
    {
        try
        {
            await _submissionService.DeleteSubmissionAsync(id);
            return Ok(ApiResponse<object>.Success("درخواست با موفقیت رد شد."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
    }
    
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteSubmission(int id)
    {
        try
        {
            await _submissionService.DeleteSubmissionAsync(id);
            return Ok(ApiResponse<object>.Success("درخواست با موفقیت حذف شد."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
    }
}
