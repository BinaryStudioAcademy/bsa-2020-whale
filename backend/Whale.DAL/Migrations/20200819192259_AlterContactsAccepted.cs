using Microsoft.EntityFrameworkCore.Migrations;

namespace Whale.DAL.Migrations
{
    public partial class AlterContactsAccepted : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "isAccepted",
                table: "Contacts",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "isAccepted",
                table: "Contacts");
        }
    }
}
