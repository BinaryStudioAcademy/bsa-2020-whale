using Microsoft.EntityFrameworkCore.Migrations;

namespace Whale.DAL.Migrations
{
    public partial class DirectMsgModelFixes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DirectMessages_ContactId",
                table: "DirectMessages");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMessages_ContactId",
                table: "DirectMessages",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_PinnedMessageId",
                table: "Contacts",
                column: "PinnedMessageId");

            migrationBuilder.AddForeignKey(
                name: "FK_Contacts_DirectMessages_PinnedMessageId",
                table: "Contacts",
                column: "PinnedMessageId",
                principalTable: "DirectMessages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contacts_DirectMessages_PinnedMessageId",
                table: "Contacts");

            migrationBuilder.DropIndex(
                name: "IX_DirectMessages_ContactId",
                table: "DirectMessages");

            migrationBuilder.DropIndex(
                name: "IX_Contacts_PinnedMessageId",
                table: "Contacts");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMessages_ContactId",
                table: "DirectMessages",
                column: "ContactId",
                unique: true);
        }
    }
}
