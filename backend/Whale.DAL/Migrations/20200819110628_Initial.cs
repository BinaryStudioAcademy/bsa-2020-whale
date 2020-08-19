using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Whale.DAL.Migrations
{
    public partial class Initial : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Achivements",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    Label = table.Column<string>(nullable: true),
                    Rarity = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Achivements", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Meetings",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    Settings = table.Column<string>(nullable: true),
                    StartTime = table.Column<DateTimeOffset>(nullable: false),
                    AnonymousCount = table.Column<int>(nullable: false),
                    IsScheduled = table.Column<bool>(nullable: false),
                    IsRecurrent = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Meetings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PollResults",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    PollId = table.Column<Guid>(nullable: false),
                    Title = table.Column<string>(nullable: true),
                    IsAnonymous = table.Column<bool>(nullable: false),
                    TotalVoted = table.Column<int>(nullable: false),
                    VoteCount = table.Column<int>(nullable: false),
                    MeetingId = table.Column<Guid>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PollResults", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    FirstName = table.Column<string>(nullable: true),
                    SecondName = table.Column<string>(nullable: true),
                    RegistrationDate = table.Column<DateTimeOffset>(nullable: false),
                    AvatarUrl = table.Column<string>(nullable: true),
                    LinkType = table.Column<int>(nullable: false),
                    Email = table.Column<string>(nullable: true),
                    Phone = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Records",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    MeetingId = table.Column<Guid>(nullable: false),
                    Source = table.Column<string>(nullable: true),
                    Type = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Records", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Records_Meetings_MeetingId",
                        column: x => x.MeetingId,
                        principalTable: "Meetings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OptionResults",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    PollResultId = table.Column<Guid>(nullable: false),
                    Option = table.Column<string>(nullable: true),
                    VoteCount = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OptionResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OptionResults_PollResults_PollResultId",
                        column: x => x.PollResultId,
                        principalTable: "PollResults",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContactSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    UserId = table.Column<Guid>(nullable: false),
                    IsBloked = table.Column<bool>(nullable: false),
                    IsMuted = table.Column<bool>(nullable: false)
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

            migrationBuilder.CreateTable(
                name: "Participants",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    Role = table.Column<int>(nullable: false),
                    UserId = table.Column<Guid>(nullable: false),
                    MeetingId = table.Column<Guid>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Participants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Participants_Meetings_MeetingId",
                        column: x => x.MeetingId,
                        principalTable: "Meetings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Participants_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Settings",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    UserId = table.Column<Guid>(nullable: false),
                    Values = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Settings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Settings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserAchivements",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    Progress = table.Column<int>(nullable: false),
                    AchivementId = table.Column<Guid>(nullable: false),
                    UserId = table.Column<Guid>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAchivements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserAchivements_Achivements_AchivementId",
                        column: x => x.AchivementId,
                        principalTable: "Achivements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserAchivements_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Voters",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    OptionResultId = table.Column<Guid>(nullable: false),
                    Email = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Voters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Voters_OptionResults_OptionResultId",
                        column: x => x.OptionResultId,
                        principalTable: "OptionResults",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DirectMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    ContactId = table.Column<Guid>(nullable: false),
                    AuthorId = table.Column<Guid>(nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(nullable: false),
                    Message = table.Column<string>(nullable: false),
                    Attachment = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DirectMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DirectMessages_Users_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Contacts",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    FirstMemberId = table.Column<Guid>(nullable: false),
                    SecondMemberId = table.Column<Guid>(nullable: false),
                    PinnedMessageId = table.Column<Guid>(nullable: true),
                    FirstMemberSettingsId = table.Column<Guid>(nullable: true),
                    SecondMemberSettingsId = table.Column<Guid>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Contacts_Users_FirstMemberId",
                        column: x => x.FirstMemberId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Contacts_ContactSettings_FirstMemberSettingsId",
                        column: x => x.FirstMemberSettingsId,
                        principalTable: "ContactSettings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Contacts_DirectMessages_PinnedMessageId",
                        column: x => x.PinnedMessageId,
                        principalTable: "DirectMessages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Contacts_Users_SecondMemberId",
                        column: x => x.SecondMemberId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Contacts_ContactSettings_SecondMemberSettingsId",
                        column: x => x.SecondMemberSettingsId,
                        principalTable: "ContactSettings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "GroupMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    ContactId = table.Column<Guid>(nullable: false),
                    Message = table.Column<string>(nullable: false),
                    Attachment = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroupMessages_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Groups",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    Label = table.Column<string>(nullable: true),
                    Description = table.Column<string>(nullable: true),
                    PinnedMessageId = table.Column<Guid>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Groups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Groups_GroupMessages_PinnedMessageId",
                        column: x => x.PinnedMessageId,
                        principalTable: "GroupMessages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GroupUsers",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    UserId = table.Column<Guid>(nullable: false),
                    GroupId = table.Column<Guid>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroupUsers_Groups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GroupUsers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_FirstMemberId",
                table: "Contacts",
                column: "FirstMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_FirstMemberSettingsId",
                table: "Contacts",
                column: "FirstMemberSettingsId");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_PinnedMessageId",
                table: "Contacts",
                column: "PinnedMessageId");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_SecondMemberId",
                table: "Contacts",
                column: "SecondMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_SecondMemberSettingsId",
                table: "Contacts",
                column: "SecondMemberSettingsId");

            migrationBuilder.CreateIndex(
                name: "IX_ContactSettings_UserId",
                table: "ContactSettings",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMessages_AuthorId",
                table: "DirectMessages",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMessages_ContactId",
                table: "DirectMessages",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupMessages_ContactId",
                table: "GroupMessages",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Groups_PinnedMessageId",
                table: "Groups",
                column: "PinnedMessageId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupUsers_GroupId",
                table: "GroupUsers",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupUsers_UserId",
                table: "GroupUsers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_OptionResults_PollResultId",
                table: "OptionResults",
                column: "PollResultId");

            migrationBuilder.CreateIndex(
                name: "IX_Participants_MeetingId",
                table: "Participants",
                column: "MeetingId");

            migrationBuilder.CreateIndex(
                name: "IX_Participants_UserId",
                table: "Participants",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Records_MeetingId",
                table: "Records",
                column: "MeetingId");

            migrationBuilder.CreateIndex(
                name: "IX_Settings_UserId",
                table: "Settings",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAchivements_AchivementId",
                table: "UserAchivements",
                column: "AchivementId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAchivements_UserId",
                table: "UserAchivements",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Voters_OptionResultId",
                table: "Voters",
                column: "OptionResultId");

            migrationBuilder.AddForeignKey(
                name: "FK_DirectMessages_Contacts_ContactId",
                table: "DirectMessages",
                column: "ContactId",
                principalTable: "Contacts",
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

            migrationBuilder.DropForeignKey(
                name: "FK_ContactSettings_Users_UserId",
                table: "ContactSettings");

            migrationBuilder.DropForeignKey(
                name: "FK_DirectMessages_Users_AuthorId",
                table: "DirectMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_Contacts_ContactSettings_FirstMemberSettingsId",
                table: "Contacts");

            migrationBuilder.DropForeignKey(
                name: "FK_Contacts_ContactSettings_SecondMemberSettingsId",
                table: "Contacts");

            migrationBuilder.DropForeignKey(
                name: "FK_Contacts_DirectMessages_PinnedMessageId",
                table: "Contacts");

            migrationBuilder.DropTable(
                name: "GroupUsers");

            migrationBuilder.DropTable(
                name: "Participants");

            migrationBuilder.DropTable(
                name: "Records");

            migrationBuilder.DropTable(
                name: "Settings");

            migrationBuilder.DropTable(
                name: "UserAchivements");

            migrationBuilder.DropTable(
                name: "Voters");

            migrationBuilder.DropTable(
                name: "Groups");

            migrationBuilder.DropTable(
                name: "Meetings");

            migrationBuilder.DropTable(
                name: "Achivements");

            migrationBuilder.DropTable(
                name: "OptionResults");

            migrationBuilder.DropTable(
                name: "GroupMessages");

            migrationBuilder.DropTable(
                name: "PollResults");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "ContactSettings");

            migrationBuilder.DropTable(
                name: "DirectMessages");

            migrationBuilder.DropTable(
                name: "Contacts");
        }
    }
}
