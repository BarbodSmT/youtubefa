// YouTubeChannelLibrary.API/Services/MailjetEmailService.cs

using Mailjet.Client;
using Mailjet.Client.TransactionalEmails;
using System.Threading.Tasks;
using YouTubeChannelLibrary.API.Services;

public class MailjetEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<MailjetEmailService> _logger;

    public MailjetEmailService(IConfiguration configuration, ILogger<MailjetEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
    {
        var apiKey = _configuration["Mailjet:ApiKey"];
        var apiSecret = _configuration["Mailjet:ApiSecret"];
        var fromEmail = _configuration["Mailjet:FromEmail"];
        var fromName = _configuration["Mailjet:FromName"];

        if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
        {
            _logger.LogError("کلیدهای API سرویس Mailjet تنظیم نشده‌اند.");
            return;
        }

        var client = new MailjetClient(apiKey, apiSecret);

        var email = new TransactionalEmailBuilder()
            .WithFrom(new SendContact(fromEmail, fromName))
            .WithSubject(subject)
            .WithHtmlPart(htmlMessage)
            .WithTo(new SendContact(toEmail))
            .Build();
        
        try
        {
            var response = await client.SendTransactionalEmailAsync(email);

            // بررسی می‌کنیم که حداقل یک ایمیل با موفقیت ارسال شده باشد
            if (response.Messages.Length > 0 && response.Messages[0].Status == "success")
            {
                _logger.LogInformation($"ایمیل با موفقیت از طریق Mailjet به {toEmail} ارسال شد.");
            }
            else
            {
                _logger.LogError($"ارسال ایمیل با Mailjet با خطا مواجه شد. پاسخ: {response.Messages[0]?.Errors?[0]?.ErrorMessage}");
            }
        }
        catch(Exception ex)
        {
            _logger.LogError(ex, $"خطای پیش‌بینی نشده در زمان ارسال ایمیل با Mailjet به {toEmail}");
        }
    }
}