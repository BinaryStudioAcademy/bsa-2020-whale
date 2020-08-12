using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Whale.DAL.Migrations
{
    public partial class RelationsChanged : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contacts_DirectMessages_PinnedMessageId",
                table: "Contacts");

            migrationBuilder.AlterColumn<Guid>(
                name: "PinnedMessageId",
                table: "Contacts",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddForeignKey(
                name: "FK_Contacts_DirectMessages_PinnedMessageId",
                table: "Contacts",
                column: "PinnedMessageId",
                principalTable: "DirectMessages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contacts_DirectMessages_PinnedMessageId",
                table: "Contacts");

            migrationBuilder.AlterColumn<Guid>(
                name: "PinnedMessageId",
                table: "Contacts",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Contacts_DirectMessages_PinnedMessageId",
                table: "Contacts",
                column: "PinnedMessageId",
                principalTable: "DirectMessages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
