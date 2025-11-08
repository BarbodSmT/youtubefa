using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using YouTubeChannelLibrary.API.Data;
using YouTubeChannelLibrary.API.Entities;
using YouTubeChannelLibrary.API.Services;
using Microsoft.AspNetCore.Identity;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

// 1. Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(config.GetConnectionString("DefaultConnection")));

// Register your custom services
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ChannelService>();
builder.Services.AddScoped<SubmissionService>();
builder.Services.AddSingleton<IEmailService, MailjetEmailService>();
builder.Services.AddHttpClient(); // Required for YouTubeUpdateService
builder.Services.AddHostedService<YouTubeUpdateService>(); 

// --- Identity Configuration ---
builder.Services.AddIdentity<User, IdentityRole<int>>(options =>
    {
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

var jwtSecret = builder.Configuration["AppSettings:JwtSecret"];
if (string.IsNullOrEmpty(jwtSecret))
{
    throw new InvalidOperationException("JWT secret key is not configured.");
}
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });
    
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});
// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextApp", policy =>
    {
        var allowedOrigins = builder.Configuration
            .GetSection("CorsSettings:AllowedOrigins")
            .Get<string[]>() ?? new[] { "http://localhost:3000" };
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// 2. Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("AllowNextApp");

// Add Authentication and Authorization middleware
app.UseAuthentication();
app.UseAuthorization();
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        var userManager = services.GetRequiredService<UserManager<User>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<int>>>();
        await context.Database.MigrateAsync();
        await Seed.SeedData(context, userManager, roleManager);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred during migration or seeding the database.");
    }
}
app.UseMiddleware<ErrorHandlingMiddleware>();

app.MapControllers();

app.Run();