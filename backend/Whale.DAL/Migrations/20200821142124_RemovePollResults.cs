using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Whale.DAL.Migrations
{
    public partial class RemovePollResults : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PollId",
                table: "PollResults");

            migrationBuilder.DropColumn(
                name: "TotalVoted",
                table: "PollResults");

            migrationBuilder.DropColumn(
                name: "VoteCount",
                table: "PollResults");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CreatedAt",
                table: "PollResults",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<bool>(
                name: "IsSingleChoice",
                table: "PollResults",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "VotedUsers",
                table: "PollResults",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "PollResults");

            migrationBuilder.DropColumn(
                name: "IsSingleChoice",
                table: "PollResults");
          
            migrationBuilder.DropColumn(
                name: "VotedUsers",
                table: "PollResults");

            migrationBuilder.AddColumn<Guid>(
                name: "PollId",
                table: "PollResults",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<int>(
                name: "TotalVoted",
                table: "PollResults",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "VoteCount",
                table: "PollResults",
                type: "int",
                nullable: false,
                defaultValue: 0);       
        }
    }
}
