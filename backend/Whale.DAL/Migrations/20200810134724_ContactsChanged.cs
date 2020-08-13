using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Whale.DAL.Migrations
{
    public partial class ContactsChanged : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contacts_Users_ContactnerId",
                table: "Contacts");

            migrationBuilder.DropForeignKey(
                name: "FK_Contacts_Users_OwnerId",
                table: "Contacts");

            migrationBuilder.DropIndex(
                name: "IX_DirectMessages_ContactId",
                table: "DirectMessages");

            migrationBuilder.DropIndex(
                name: "IX_Contacts_ContactnerId",
                table: "Contacts");

            migrationBuilder.DropIndex(
                name: "IX_Contacts_OwnerId",
                table: "Contacts");

            migrationBuilder.DropColumn(
                name: "ContactnerId",
                table: "Contacts");

            migrationBuilder.DropColumn(
                name: "IsBlocked",
                table: "Contacts");

            migrationBuilder.DropColumn(
                name: "OwnerId",
                table: "Contacts");

            migrationBuilder.AddColumn<Guid>(
                name: "FirstMemberId",
                table: "Contacts",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "PinnedMessageId",
                table: "Contacts",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "SecondMemberId",
                table: "Contacts",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "ContactSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    ContactId = table.Column<Guid>(nullable: false),
                    UserId = table.Column<Guid>(nullable: false),
                    IsBloked = table.Column<bool>(nullable: false),
                    IsMuted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContactSettings_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ContactSettings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DirectMessages_ContactId",
                table: "DirectMessages",
                column: "ContactId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_FirstMemberId",
                table: "Contacts",
                column: "FirstMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_SecondMemberId",
                table: "Contacts",
                column: "SecondMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_ContactSettings_ContactId",
                table: "ContactSettings",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_ContactSettings_UserId",
                table: "ContactSettings",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Contacts_Users_FirstMemberId",
                table: "Contacts",
                column: "FirstMemberId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Contacts_Users_SecondMemberId",
                table: "Contacts",
                column: "SecondMemberId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contacts_Users_FirstMemberId",
                table: "Contacts");

            migrationBuilder.DropForeignKey(
                name: "FK_Contacts_Users_SecondMemberId",
                table: "Contacts");

            migrationBuilder.DropTable(
                name: "ContactSettings");

            migrationBuilder.DropIndex(
                name: "IX_DirectMessages_ContactId",
                table: "DirectMessages");

            migrationBuilder.DropIndex(
                name: "IX_Contacts_FirstMemberId",
                table: "Contacts");

            migrationBuilder.DropIndex(
                name: "IX_Contacts_SecondMemberId",
                table: "Contacts");

            migrationBuilder.DropColumn(
                name: "FirstMemberId",
                table: "Contacts");

            migrationBuilder.DropColumn(
                name: "PinnedMessageId",
                table: "Contacts");

            migrationBuilder.DropColumn(
                name: "SecondMemberId",
                table: "Contacts");

            migrationBuilder.AddColumn<Guid>(
                name: "ContactnerId",
                table: "Contacts",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<bool>(
                name: "IsBlocked",
                table: "Contacts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "OwnerId",
                table: "Contacts",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_DirectMessages_ContactId",
                table: "DirectMessages",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_ContactnerId",
                table: "Contacts",
                column: "ContactnerId");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_OwnerId",
                table: "Contacts",
                column: "OwnerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Contacts_Users_ContactnerId",
                table: "Contacts",
                column: "ContactnerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Contacts_Users_OwnerId",
                table: "Contacts",
                column: "OwnerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
