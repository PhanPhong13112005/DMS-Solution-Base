using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BillingMaintenanceService.Migrations
{
    /// <inheritdoc />
    public partial class AddUserAuthAndSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReferenceId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "PasswordHash", "ReferenceId", "Role", "Username" },
                values: new object[,]
                {
                    { new Guid("55555555-5555-5555-5555-555555555555"), "$2a$11$K.eA15gXoD825z6Yg6A8U.H4iF4V4WwJ1F95O9v.r3p101m4e3j8O", null, "Admin", "admin" },
                    { new Guid("66666666-6666-6666-6666-666666666666"), "$2a$11$K.eA15gXoD825z6Yg6A8U.H4iF4V4WwJ1F95O9v.r3p101m4e3j8O", null, "Staff", "staff" },
                    { new Guid("77777777-7777-7777-7777-777777777777"), "$2a$11$K.eA15gXoD825z6Yg6A8U.H4iF4V4WwJ1F95O9v.r3p101m4e3j8O", 1001, "Student", "student1001" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
