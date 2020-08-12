using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Whale.DAL.Migrations
{
    public partial class ContactsAlterFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ContactSettings_Contacts_ContactId",
                table: "ContactSettings");

            migrationBuilder.DropTable(
                name: "Polls");

            migrationBuilder.DropIndex(
                name: "IX_DirectMessages_ContactId",
                table: "DirectMessages");

            migrationBuilder.DropIndex(
                name: "IX_ContactSettings_ContactId",
                table: "ContactSettings");

            migrationBuilder.DropColumn(
                name: "ContactId",
                table: "ContactSettings");

            migrationBuilder.AddColumn<Guid>(
                name: "FirstMemberSettingsId",
                table: "Contacts",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SecondMemberSettingsId",
                table: "Contacts",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_DirectMessages_ContactId",
                table: "DirectMessages",
                column: "ContactId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_FirstMemberSettingsId",
                table: "Contacts",
                column: "FirstMemberSettingsId");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_SecondMemberSettingsId",
                table: "Contacts",
                column: "SecondMemberSettingsId");

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

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contacts_ContactSettings_FirstMemberSettingsId",
                table: "Contacts");

            migrationBuilder.DropForeignKey(
                name: "FK_Contacts_ContactSettings_SecondMemberSettingsId",
                table: "Contacts");

            migrationBuilder.DropIndex(
                name: "IX_DirectMessages_ContactId",
                table: "DirectMessages");

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

            migrationBuilder.AddColumn<Guid>(
                name: "ContactId",
                table: "ContactSettings",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Polls",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Answer1 = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Answer2 = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Answer3 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Answer4 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Answer5 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsAnonymous = table.Column<bool>(type: "bit", nullable: false),
                    IsSingleChoice = table.Column<bool>(type: "bit", nullable: false),
                    MeetingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Polls", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Polls_Meetings_MeetingId",
                        column: x => x.MeetingId,
                        principalTable: "Meetings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DirectMessages_ContactId",
                table: "DirectMessages",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_ContactSettings_ContactId",
                table: "ContactSettings",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Polls_MeetingId",
                table: "Polls",
                column: "MeetingId");

            migrationBuilder.AddForeignKey(
                name: "FK_ContactSettings_Contacts_ContactId",
                table: "ContactSettings",
                column: "ContactId",
                principalTable: "Contacts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
