using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BillingMaintenanceService.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingFields_BillAndMaintenance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "MaintenanceRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StudentId",
                table: "MaintenanceRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BillType",
                table: "Bills",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DueDate",
                table: "Bills",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ExtraAmount",
                table: "Bills",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "FeeReason",
                table: "Bills",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReceiptCode",
                table: "Bills",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Bills",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "BillType", "DueDate", "ExtraAmount", "FeeReason", "ReceiptCode" },
                values: new object[] { "MONTHLY", new DateTime(2026, 6, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), 0m, null, "BR-20260605-11111111" });

            migrationBuilder.UpdateData(
                table: "Bills",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "BillType", "DueDate", "ExtraAmount", "FeeReason", "ReceiptCode" },
                values: new object[] { "MONTHLY", new DateTime(2026, 6, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), 0m, null, null });

            migrationBuilder.InsertData(
                table: "Bills",
                columns: new[] { "Id", "BillType", "ContractId", "CreatedAt", "DueDate", "ElectricityCost", "ExtraAmount", "FeeReason", "IsPaid", "PaidAt", "ReceiptCode", "RoomId", "ServiceFee", "StudentId", "TargetMonth", "Title", "TotalAmount", "WaterCost" },
                values: new object[] { new Guid("88888888-8888-8888-8888-888888888888"), "EXTRA_FEE", "CTR-001", new DateTime(2026, 6, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), 0m, 200000m, "Phạt vi phạm", false, null, null, 101, 0m, 1001, "Lẻ phát sinh", "Phí phát sinh - Phạt vi phạm", 200000m, 0m });

            migrationBuilder.UpdateData(
                table: "MaintenanceRequests",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "ImageUrl", "StudentId" },
                values: new object[] { null, 1001 });

            migrationBuilder.UpdateData(
                table: "MaintenanceRequests",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                columns: new[] { "ImageUrl", "StudentId" },
                values: new object[] { null, 1002 });

            migrationBuilder.InsertData(
                table: "MaintenanceRequests",
                columns: new[] { "Id", "Category", "CreatedAt", "Description", "ImageUrl", "Priority", "RoomId", "Status", "StudentId", "Title", "UpdatedAt" },
                values: new object[] { new Guid("99999999-9999-9999-9999-999999999999"), "Điện", new DateTime(2026, 6, 22, 0, 0, 0, 0, DateTimeKind.Unspecified), "Bóng đèn phòng ngủ bị hỏng, phòng tối, ảnh hưởng việc học", null, "Normal", 101, "Processing", 1001, "Bóng đèn phòng bị hỏng", new DateTime(2026, 6, 23, 0, 0, 0, 0, DateTimeKind.Unspecified) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Bills",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-888888888888"));

            migrationBuilder.DeleteData(
                table: "MaintenanceRequests",
                keyColumn: "Id",
                keyValue: new Guid("99999999-9999-9999-9999-999999999999"));

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "StudentId",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "BillType",
                table: "Bills");

            migrationBuilder.DropColumn(
                name: "DueDate",
                table: "Bills");

            migrationBuilder.DropColumn(
                name: "ExtraAmount",
                table: "Bills");

            migrationBuilder.DropColumn(
                name: "FeeReason",
                table: "Bills");

            migrationBuilder.DropColumn(
                name: "ReceiptCode",
                table: "Bills");
        }
    }
}
