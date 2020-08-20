using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Whale.DAL.Migrations
{
    public partial class MakeOptionResultsJson : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Voters");

            migrationBuilder.DropTable(
                name: "OptionResults");

            migrationBuilder.AddColumn<string>(
                name: "OptionResults",
                table: "PollResults",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OptionResults",
                table: "PollResults");

            migrationBuilder.CreateTable(
                name: "OptionResults",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Option = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PollResultId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VoteCount = table.Column<int>(type: "int", nullable: false)
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
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OptionResultId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
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
    }
}
