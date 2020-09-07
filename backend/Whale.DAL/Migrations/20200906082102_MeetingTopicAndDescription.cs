using Microsoft.EntityFrameworkCore.Migrations;

namespace Whale.DAL.Migrations
{
    public partial class MeetingTopicAndDescription : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "isAccepted",
                table: "Contacts",
                newName: "IsAccepted");

            migrationBuilder.AddColumn<bool>(
                name: "IsAnonymous",
                table: "Questions",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Meetings",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Topic",
                table: "Meetings",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AgendaPoints_MeetingId",
                table: "AgendaPoints",
                column: "MeetingId");

            migrationBuilder.AddForeignKey(
                name: "FK_AgendaPoints_Meetings_MeetingId",
                table: "AgendaPoints",
                column: "MeetingId",
                principalTable: "Meetings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AgendaPoints_Meetings_MeetingId",
                table: "AgendaPoints");

            migrationBuilder.DropIndex(
                name: "IX_AgendaPoints_MeetingId",
                table: "AgendaPoints");

            migrationBuilder.DropColumn(
                name: "IsAnonymous",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "Topic",
                table: "Meetings");

            migrationBuilder.RenameColumn(
                name: "IsAccepted",
                table: "Contacts",
                newName: "isAccepted");
        }
    }
}
