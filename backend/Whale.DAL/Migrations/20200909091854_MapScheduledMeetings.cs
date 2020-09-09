using Microsoft.EntityFrameworkCore.Migrations;

namespace Whale.DAL.Migrations
{
    public partial class MapScheduledMeetings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_ScheduledMeetings_CreatorId",
                table: "ScheduledMeetings",
                column: "CreatorId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledMeetings_MeetingId",
                table: "ScheduledMeetings",
                column: "MeetingId");

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduledMeetings_Users_CreatorId",
                table: "ScheduledMeetings",
                column: "CreatorId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduledMeetings_Meetings_MeetingId",
                table: "ScheduledMeetings",
                column: "MeetingId",
                principalTable: "Meetings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ScheduledMeetings_Users_CreatorId",
                table: "ScheduledMeetings");

            migrationBuilder.DropForeignKey(
                name: "FK_ScheduledMeetings_Meetings_MeetingId",
                table: "ScheduledMeetings");

            migrationBuilder.DropIndex(
                name: "IX_ScheduledMeetings_CreatorId",
                table: "ScheduledMeetings");

            migrationBuilder.DropIndex(
                name: "IX_ScheduledMeetings_MeetingId",
                table: "ScheduledMeetings");
        }
    }
}
