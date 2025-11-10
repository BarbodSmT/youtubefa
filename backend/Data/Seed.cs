using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using YouTubeChannelLibrary.API.Entities;

namespace YouTubeChannelLibrary.API.Data
{
    public class Seed
    {
        public static async Task SeedData(AppDbContext context, UserManager<User> userManager, RoleManager<IdentityRole<int>> roleManager)
        {
            await SeedRoles(roleManager);
            await SeedUsers(userManager);
            await SeedCategories(context);
        }

        private static async Task SeedRoles(RoleManager<IdentityRole<int>> roleManager)
        {
            if (!await roleManager.Roles.AnyAsync())
            {
                var roles = new List<IdentityRole<int>>
                {
                    new() { Name = "Admin" },
                    new() { Name = "User" }
                };

                foreach (var role in roles)
                {
                    await roleManager.CreateAsync(role);
                }
            }
        }

        private static async Task SeedUsers(UserManager<User> userManager)
        {
            if (!await userManager.Users.AnyAsync())
            {
                var adminUser = new User
                {
                    UserName = "admin@example.com", // UserName is required
                    Email = "admin@example.com",
                    Name = "Admin User",
                    EmailConfirmed = true // Use the correct Identity property
                };
                
                var adminResult = await userManager.CreateAsync(adminUser, "Admin@123");
                if (adminResult.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                }

                var regularUser = new User
                {
                    UserName = "user@example.com", // UserName is required
                    Email = "user@example.com",
                    Name = "Regular User",
                    EmailConfirmed = true // Use the correct Identity property
                };
                
                var userResult = await userManager.CreateAsync(regularUser, "User@123");
                if (userResult.Succeeded)
                {
                    await userManager.AddToRoleAsync(regularUser, "User");
                }
            }
        }

        private static async Task SeedCategories(AppDbContext context)
        {
            if (!await context.Categories.AnyAsync())
            {
                var categories = new List<Category>
                {
                    new() { Name = "سرگرمی", Icon = "🎭", Color = "#e91e63" },
                    new() { Name = "آموزشی", Icon = "📚", Color = "#4caf50" },
                    new() { Name = "تکنولوژی", Icon = "💻", Color = "#ff9800" },
                    new() { Name = "بازی", Icon = "🎮", Color = "#9c27b0" },
                    new() { Name = "موسیقی", Icon = "🎵", Color = "#f44336" },
                    new() { Name = "آشپزی", Icon = "👨‍🍳", Color = "#795548" },
                    new() { Name = "ورزش", Icon = "⚽", Color = "#607d8b" },
                    new() { Name = "کمدی", Icon = "😂", Color = "#ffeb3b" },
                    new() { Name = "سبک زندگی", Icon = "✨", Color = "#00bcd4" },
                };
                await context.Categories.AddRangeAsync(categories);
                await context.SaveChangesAsync();
            }
        }
    }
}