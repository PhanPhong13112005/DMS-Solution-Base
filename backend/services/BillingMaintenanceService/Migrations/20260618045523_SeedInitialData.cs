using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BillingMaintenanceService.Migrations
{
    /// <inheritdoc />
    public partial class SeedInitialData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Bills",
                columns: new[] { "Id", "ElectricityCost", "IsPaid", "RoomId", "TargetMonth", "TotalAmount", "WaterCost" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), 450000m, true, 0, "", 570000m, 120000m },
                    { new Guid("22222222-2222-2222-2222-222222222222"), 500000m, false, 0, "", 650000m, 150000m }
                });

            migrationBuilder.InsertData(
                table: "MaintenanceRequests",
                columns: new[] { "Id", "CreatedAt", "Description", "RoomId", "Status" },
                values: new object[,]
                {
                    { new Guid("33333333-3333-3333-3333-333333333333"), new DateTime(2026, 6, 13, 11, 55, 22, 727, DateTimeKind.Local).AddTicks(5215), "Hỏng điều hòa", 101, "Completed" },
                    { new Guid("44444444-4444-4444-4444-444444444444"), new DateTime(2026, 6, 18, 11, 55, 22, 728, DateTimeKind.Local).AddTicks(9450), "Rò rỉ nước", 205, "Pending" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Bills",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "Bills",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"));

            migrationBuilder.DeleteData(
                table: "MaintenanceRequests",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"));

            migrationBuilder.DeleteData(
                table: "MaintenanceRequests",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"));
        }
    }
}
