using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YouTubeChannelLibrary.API.Migrations
{
    /// <inheritdoc />
    public partial class AddIsVipToChannel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsVip",
                table: "Channels",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsVip",
                table: "Channels");
        }
    }
}
