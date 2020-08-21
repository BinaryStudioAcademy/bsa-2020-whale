using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Whale.DAL.Migrations
{
    public partial class DropContactSettings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contacts_ContactSettings_FirstMemberSettingsId",
                table: "Contacts");

            migrationBuilder.DropForeignKey(
                name: "FK_Contacts_ContactSettings_SecondMemberSettingsId",
                table: "Contacts");

            migrationBuilder.DropTable(
                name: "ContactSettings");

            migrationBuilder.DropIndex(
                name: "IX_Contacts_FirstMemberSettingsId",
                table: "Contacts");

            migrationBuilder.DropIndex(
                name: "IX_Contacts_SecondMemberSettingsId",
                table: "Contacts");

            migrationBuilder.DropColumn(
                name: "FirstMemberSettingsId",
                table: "Contacts");

            migrationBuilder.DropColumn(
                name: "SecondMemberSettingsId",
                table: "Contacts");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "FirstMemberSettingsId",
                table: "Contacts",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SecondMemberSettingsId",
                table: "Contacts",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ContactSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsBloked = table.Column<bool>(type: "bit", nullable: false),
                    IsMuted = table.Column<bool>(type: "bit", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContactSettings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_FirstMemberSettingsId",
                table: "Contacts",
                column: "FirstMemberSettingsId");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_SecondMemberSettingsId",
                table: "Contacts",
                column: "SecondMemberSettingsId");

            migrationBuilder.CreateIndex(
                name: "IX_ContactSettings_UserId",
                table: "ContactSettings",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Contacts_ContactSettings_FirstMemberSettingsId",
                table: "Contacts",
                column: "FirstMemberSettingsId",
                principalTable: "ContactSettings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Contacts_ContactSettings_SecondMemberSettingsId",
                table: "Contacts",
                column: "SecondMemberSettingsId",
                principalTable: "ContactSettings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
