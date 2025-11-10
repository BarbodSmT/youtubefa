using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using YouTubeChannelLibrary.API.Entities;

namespace YouTubeChannelLibrary.API.Data;

public class AppDbContext : IdentityDbContext<User, IdentityRole<int>, int>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<YouTubeChannel> Channels { get; set; }
    public DbSet<Submission> Submissions { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<YouTubeVideo> YouTubeVideos { get; set; }
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.Entity<YouTubeChannel>(entity =>
        {
            entity.Property(e => e.Title)
                  .UseCollation("Persian_100_CI_AI_SC_UTF8");

            entity.Property(e => e.Description)
                  .UseCollation("Persian_100_CI_AI_SC_UTF8");

            entity.Property(e => e.Tags)
                  .UseCollation("Persian_100_CI_AI_SC_UTF8");
        });

        builder.Entity<Category>(entity =>
        {
            entity.Property(e => e.Name)
                  .UseCollation("Persian_100_CI_AI_SC_UTF8");
        });
        builder.Entity<YouTubeChannel>()
            .HasMany(c => c.RecentVideos)
            .WithOne(v => v.YouTubeChannel)
            .HasForeignKey(v => v.ChannelId);
    }
}

