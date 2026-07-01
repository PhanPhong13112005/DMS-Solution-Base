FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["backend/services/BillingMaintenanceService/BillingMaintenanceService.csproj", "backend/services/BillingMaintenanceService/"]
COPY ["DMS.Shared/DMS.Shared.csproj", "DMS.Shared/"]
RUN dotnet restore "backend/services/BillingMaintenanceService/BillingMaintenanceService.csproj"

# Copy everything else and build
COPY ["backend/services/BillingMaintenanceService/", "backend/services/BillingMaintenanceService/"]
COPY ["DMS.Shared/", "DMS.Shared/"]

WORKDIR "/src/backend/services/BillingMaintenanceService"
RUN dotnet publish "BillingMaintenanceService.csproj" -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8082
ENV ASPNETCORE_URLS=http://+:8082

ENTRYPOINT ["dotnet", "BillingMaintenanceService.dll"]
