using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BillingMaintenanceService.Migrations
{
    /// <inheritdoc />
    public partial class ExpandModels_And_FixSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "MaintenanceRequests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Priority",
                table: "MaintenanceRequests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "MaintenanceRequests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "MaintenanceRequests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContractId",
                table: "Bills",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Bills",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "PaidAt",
                table: "Bills",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ServiceFee",
                table: "Bills",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "StudentId",
                table: "Bills",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Bills",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Bills",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ContractId", "CreatedAt", "PaidAt", "RoomId", "ServiceFee", "StudentId", "TargetMonth", "Title", "TotalAmount" },
                values: new object[] { "CTR-001", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2026, 6, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), 101, 50000m, 1001, "06/2026", "Hóa đơn tháng 06/2026 - Phòng 101", 620000m });

            migrationBuilder.UpdateData(
                table: "Bills",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "ContractId", "CreatedAt", "PaidAt", "RoomId", "ServiceFee", "StudentId", "TargetMonth", "Title", "TotalAmount" },
                values: new object[] { "CTR-002", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, 205, 50000m, 1002, "06/2026", "Hóa đơn tháng 06/2026 - Phòng 205", 700000m });

            migrationBuilder.UpdateData(
                table: "MaintenanceRequests",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "Category", "Description", "Priority", "Title", "UpdatedAt" },
                values: new object[] { "Điện", "Điều hòa không lạnh, phát ra tiếng ồn lớn, chảy nước", "Normal", "Hỏng điều hòa", new DateTime(2026, 6, 12, 0, 0, 0, 0, DateTimeKind.Unspecified) });

            migrationBuilder.UpdateData(
                table: "MaintenanceRequests",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                columns: new[] { "Category", "CreatedAt", "Description", "Priority", "Title", "UpdatedAt" },
                values: new object[] { "Nước", new DateTime(2026, 6, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), "Ống nước dưới bồn rửa mặt bị nứt, nước chảy ra sàn nhà vệ sinh", "Critical", "Rò rỉ đường ống nước", null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "ContractId",
                table: "Bills");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Bills");

            migrationBuilder.DropColumn(
                name: "PaidAt",
                table: "Bills");

            migrationBuilder.DropColumn(
                name: "ServiceFee",
                table: "Bills");

            migrationBuilder.DropColumn(
                name: "StudentId",
                table: "Bills");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "Bills");

            migrationBuilder.UpdateData(
                table: "Bills",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "RoomId", "TargetMonth", "TotalAmount" },
                values: new object[] { 0, "", 570000m });

            migrationBuilder.UpdateData(
                table: "Bills",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "RoomId", "TargetMonth", "TotalAmount" },
                values: new object[] { 0, "", 650000m });

            migrationBuilder.UpdateData(
                table: "MaintenanceRequests",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "Description",
                value: "Hỏng điều hòa");

            migrationBuilder.UpdateData(
                table: "MaintenanceRequests",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                columns: new[] { "CreatedAt", "Description" },
                values: new object[] { new DateTime(2026, 6, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Rò rỉ nước" });
        }
    }
}
