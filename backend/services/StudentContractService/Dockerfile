# 1. Giai đoạn Build: Dùng SDK để biên dịch code
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy file cấu hình và tải thư viện (Restore)
COPY ["StudentContractService.csproj", "./"]
RUN dotnet restore "./StudentContractService.csproj"

# Copy toàn bộ code vào và Build
COPY . .
RUN dotnet build "./StudentContractService.csproj" -c Release -o /app/build

# 2. Giai đoạn Publish: Tối ưu hóa dung lượng file chạy
FROM build AS publish
RUN dotnet publish "./StudentContractService.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 3. Giai đoạn Runtime: Chỉ dùng bản ASP.NET siêu nhẹ để chạy web
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Mở cổng 8081 theo đúng quy định của Nhóm 2
EXPOSE 8081 

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "StudentContractService.dll"]