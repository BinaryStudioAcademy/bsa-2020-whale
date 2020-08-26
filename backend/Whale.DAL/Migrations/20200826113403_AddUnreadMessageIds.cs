using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Whale.DAL.Migrations
{
    public partial class AddUnreadMessageIds : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UnreadMessageIds",
                columns: table => new
                {
                    MessageId = table.Column<Guid>(nullable: false),
                    ReceiverId = table.Column<Guid>(nullable: false)
                },
                constraints: table =>
                {
                    table.ForeignKey(
                        name: "FK_UnreadMessageIds_DirectMessages_MessageId",
                        column: x => x.MessageId,
                        principalTable: "DirectMessages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_UnreadMessageIds_GroupMessages_MessageId",
                        column: x => x.MessageId,
                        principalTable: "GroupMessages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_UnreadMessageIds_Users_ReceiverId",
                        column: x => x.ReceiverId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UnreadMessageIds_MessageId",
                table: "UnreadMessageIds",
                column: "MessageId");

            migrationBuilder.CreateIndex(
                name: "IX_UnreadMessageIds_ReceiverId",
                table: "UnreadMessageIds",
                column: "ReceiverId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UnreadMessageIds");
        }
    }
}
