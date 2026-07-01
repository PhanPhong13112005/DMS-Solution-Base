# Khởi động các dịch vụ Docker cần thiết (Database và RabbitMQ)
Write-Host "Dang khoi dong SQL Server va RabbitMQ..." -ForegroundColor Green
docker start dms-sqlserver dms-rabbitmq

# Chờ 10 giây để Database khởi động hoàn tất (SQL Server trong Docker cần thời gian để ready)
Start-Sleep -Seconds 10

# Khởi chạy 4 Service Backend trong 4 cửa sổ riêng biệt để dễ theo dõi Log
Write-Host "Dang khoi dong cac Backend Services..." -ForegroundColor Green

$backendPath = ".\backend"

Start-Process powershell -ArgumentList "-NoExit -Command `"title 'RoomBuilding (Nhom 1)'; cd $backendPath; dotnet run --project services\RoomBuildingService\RoomBuildingService.csproj`""
Start-Process powershell -ArgumentList "-NoExit -Command `"title 'StudentContract (Nhom 2)'; cd $backendPath; dotnet run --project services\StudentContractService\StudentContractService.csproj`""
Start-Process powershell -ArgumentList "-NoExit -Command `"title 'BillingMaintenance (Nhom 3)'; cd $backendPath; dotnet run --project services\BillingMaintenanceService\BillingMaintenanceService.csproj`""
Start-Process powershell -ArgumentList "-NoExit -Command `"title 'API Gateway'; cd $backendPath; dotnet run --project services\Gateway\Gateway.csproj`""

Write-Host "Da gui lenh chay toan bo 4 services!" -ForegroundColor Cyan
Write-Host "Ban co the chay tiep 'npm run dev' o thu muc frontend nhe." -ForegroundColor Yellow
