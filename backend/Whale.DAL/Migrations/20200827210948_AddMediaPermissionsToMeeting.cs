using Microsoft.EntityFrameworkCore.Migrations;

namespace Whale.DAL.Migrations
{
    public partial class AddMediaPermissionsToMeeting : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsAudioAllowed",
                table: "Meetings",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsVideoAllowed",
                table: "Meetings",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAudioAllowed",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "IsVideoAllowed",
                table: "Meetings");
        }
    }
}
