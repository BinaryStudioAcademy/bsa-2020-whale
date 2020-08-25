using Microsoft.EntityFrameworkCore.Migrations;

namespace Whale.DAL.Migrations
{
    public partial class AddedPhotoUrlForGroup : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PhotoUrl",
                table: "Groups",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PhotoUrl",
                table: "Groups");
        }
    }
}
