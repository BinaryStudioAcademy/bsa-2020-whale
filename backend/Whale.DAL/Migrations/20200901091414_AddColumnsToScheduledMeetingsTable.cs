using Microsoft.EntityFrameworkCore.Migrations;

namespace Whale.DAL.Migrations
{
    public partial class AddColumnsToScheduledMeetingsTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FullURL",
                table: "ScheduledMeetings",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Password",
                table: "ScheduledMeetings",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShortURL",
                table: "ScheduledMeetings",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FullURL",
                table: "ScheduledMeetings");

            migrationBuilder.DropColumn(
                name: "Password",
                table: "ScheduledMeetings");

            migrationBuilder.DropColumn(
                name: "ShortURL",
                table: "ScheduledMeetings");
        }
    }
}
