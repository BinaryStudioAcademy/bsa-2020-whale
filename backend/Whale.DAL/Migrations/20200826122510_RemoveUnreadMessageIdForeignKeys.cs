using Microsoft.EntityFrameworkCore.Migrations;

namespace Whale.DAL.Migrations
{
    public partial class RemoveUnreadMessageIdForeignKeys : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UnreadMessageIds_DirectMessages_MessageId",
                table: "UnreadMessageIds");

            migrationBuilder.DropForeignKey(
                name: "FK_UnreadMessageIds_GroupMessages_MessageId",
                table: "UnreadMessageIds");

            migrationBuilder.DropForeignKey(
                name: "FK_UnreadMessageIds_Users_ReceiverId",
                table: "UnreadMessageIds");

            migrationBuilder.DropIndex(
                name: "IX_UnreadMessageIds_MessageId",
                table: "UnreadMessageIds");

            migrationBuilder.DropIndex(
                name: "IX_UnreadMessageIds_ReceiverId",
                table: "UnreadMessageIds");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_UnreadMessageIds_MessageId",
                table: "UnreadMessageIds",
                column: "MessageId");

            migrationBuilder.CreateIndex(
                name: "IX_UnreadMessageIds_ReceiverId",
                table: "UnreadMessageIds",
                column: "ReceiverId");

            migrationBuilder.AddForeignKey(
                name: "FK_UnreadMessageIds_DirectMessages_MessageId",
                table: "UnreadMessageIds",
                column: "MessageId",
                principalTable: "DirectMessages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UnreadMessageIds_GroupMessages_MessageId",
                table: "UnreadMessageIds",
                column: "MessageId",
                principalTable: "GroupMessages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UnreadMessageIds_Users_ReceiverId",
                table: "UnreadMessageIds",
                column: "ReceiverId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
