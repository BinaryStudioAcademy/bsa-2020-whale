using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Whale.DAL.Migrations
{
    public partial class DirectMessageFieldsAdded : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AuthorId",
                table: "DirectMessages",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "DirectMessages",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateIndex(
                name: "IX_DirectMessages_AuthorId",
                table: "DirectMessages",
                column: "AuthorId");

            migrationBuilder.AddForeignKey(
                name: "FK_DirectMessages_Users_AuthorId",
                table: "DirectMessages",
                column: "AuthorId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DirectMessages_Users_AuthorId",
                table: "DirectMessages");

            migrationBuilder.DropIndex(
                name: "IX_DirectMessages_AuthorId",
                table: "DirectMessages");

            migrationBuilder.DropColumn(
                name: "AuthorId",
                table: "DirectMessages");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "DirectMessages");
        }
    }
}
