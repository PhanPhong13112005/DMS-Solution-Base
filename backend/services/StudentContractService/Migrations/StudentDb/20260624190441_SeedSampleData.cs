using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentContractService.Migrations.StudentDb
{
    /// <inheritdoc />
    public partial class SeedSampleData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Students",
                columns: new[] { "Id", "CurrentRoomId", "Email", "FullName", "IdCard", "PhoneNumber", "StudentCode" },
                values: new object[] { new Guid("11111111-1111-1111-1111-111111111111"), 102, "vana@student.edu.vn", "Nguyễn Văn A", "012345678901", "0987654321", "SV202601" });

            migrationBuilder.InsertData(
                table: "Contracts",
                columns: new[] { "Id", "EndDate", "RoomId", "RoomPrice", "StartDate", "Status", "StudentId" },
                values: new object[] { new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), 102, 1500000m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Active", new Guid("11111111-1111-1111-1111-111111111111") });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Contracts",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"));

            migrationBuilder.DeleteData(
                table: "Students",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));
        }
    }
}
