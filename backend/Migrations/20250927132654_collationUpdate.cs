using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YouTubeChannelLibrary.API.Migrations
{
    /// <inheritdoc />
    public partial class collationUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "Channels",
                type: "nvarchar(max)",
                nullable: false,
                collation: "Persian_100_CI_AI_SC_UTF8",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Tags",
                table: "Channels",
                type: "nvarchar(max)",
                nullable: true,
                collation: "Persian_100_CI_AI_SC_UTF8",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Channels",
                type: "nvarchar(max)",
                nullable: false,
                collation: "Persian_100_CI_AI_SC_UTF8",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Categories",
                type: "nvarchar(max)",
                nullable: false,
                collation: "Persian_100_CI_AI_SC_UTF8",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "Channels",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldCollation: "Persian_100_CI_AI_SC_UTF8");

            migrationBuilder.AlterColumn<string>(
                name: "Tags",
                table: "Channels",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true,
                oldCollation: "Persian_100_CI_AI_SC_UTF8");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Channels",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldCollation: "Persian_100_CI_AI_SC_UTF8");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Categories",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldCollation: "Persian_100_CI_AI_SC_UTF8");
        }
    }
}
