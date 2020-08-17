using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Whale.DAL.Migrations
{
    public partial class AddPollResults : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.CreateIndex(
                name: "IX_OptionResults_PollResultId",
                table: "OptionResults",
                column: "PollResultId");

            migrationBuilder.CreateIndex(
                name: "IX_Voters_OptionResultId",
                table: "Voters",
                column: "OptionResultId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Voters");

            migrationBuilder.DropTable(
                name: "OptionResults");

            migrationBuilder.DropTable(
                name: "PollResults");
        }
    }
}
