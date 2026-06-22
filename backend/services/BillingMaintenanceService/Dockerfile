# Dùng SDK .NET 9 để build ứng dụng
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy file csproj và restore các packages
COPY *.csproj ./
RUN dotnet restore

# Copy toàn bộ mã nguồn và build ra bản Release
COPY . ./
RUN dotnet publish -c Release -o out

# Dùng Runtime .NET 9 để chạy ứng dụng (nhẹ hơn SDK)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/out ./

# Mở cổng 8082 theo chuẩn README cho Nhóm 3
EXPOSE 8082
ENV ASPNETCORE_URLS=http://+:8082

# Chạy ứng dụng
ENTRYPOINT ["dotnet", "BillingMaintenanceService.dll"]
