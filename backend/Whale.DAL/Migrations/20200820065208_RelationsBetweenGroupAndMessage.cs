using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Whale.DAL.Migrations
{
    public partial class RelationsBetweenGroupAndMessage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GroupMessages_Contacts_ContactId",
                table: "GroupMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_Groups_GroupMessages_PinnedMessageId",
                table: "Groups");

            migrationBuilder.DropIndex(
                name: "IX_GroupMessages_ContactId",
                table: "GroupMessages");

            migrationBuilder.DropColumn(
                name: "ContactId",
                table: "GroupMessages");

            migrationBuilder.AlterColumn<Guid>(
                name: "PinnedMessageId",
                table: "Groups",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<Guid>(
                name: "AuthorId",
                table: "GroupMessages",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CreatedAt",
                table: "GroupMessages",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<Guid>(
                name: "GroupId",
                table: "GroupMessages",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_GroupMessages_AuthorId",
                table: "GroupMessages",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupMessages_GroupId",
                table: "GroupMessages",
                column: "GroupId");

            migrationBuilder.AddForeignKey(
                name: "FK_GroupMessages_Users_AuthorId",
                table: "GroupMessages",
                column: "AuthorId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GroupMessages_Groups_GroupId",
                table: "GroupMessages",
                column: "GroupId",
                principalTable: "Groups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Groups_GroupMessages_PinnedMessageId",
                table: "Groups",
                column: "PinnedMessageId",
                principalTable: "GroupMessages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GroupMessages_Users_AuthorId",
                table: "GroupMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_GroupMessages_Groups_GroupId",
                table: "GroupMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_Groups_GroupMessages_PinnedMessageId",
                table: "Groups");

            migrationBuilder.DropIndex(
                name: "IX_GroupMessages_AuthorId",
                table: "GroupMessages");

            migrationBuilder.DropIndex(
                name: "IX_GroupMessages_GroupId",
                table: "GroupMessages");

            migrationBuilder.DropColumn(
                name: "AuthorId",
                table: "GroupMessages");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "GroupMessages");

            migrationBuilder.DropColumn(
                name: "GroupId",
                table: "GroupMessages");

            migrationBuilder.AlterColumn<Guid>(
                name: "PinnedMessageId",
                table: "Groups",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ContactId",
                table: "GroupMessages",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_GroupMessages_ContactId",
                table: "GroupMessages",
                column: "ContactId");

            migrationBuilder.AddForeignKey(
                name: "FK_GroupMessages_Contacts_ContactId",
                table: "GroupMessages",
                column: "ContactId",
                principalTable: "Contacts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Groups_GroupMessages_PinnedMessageId",
                table: "Groups",
                column: "PinnedMessageId",
                principalTable: "GroupMessages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
