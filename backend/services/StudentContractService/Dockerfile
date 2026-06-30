FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["backend/services/StudentContractService/StudentContractService.csproj", "backend/services/StudentContractService/"]
COPY ["DMS.Shared/DMS.Shared.csproj", "DMS.Shared/"]
RUN dotnet restore "backend/services/StudentContractService/StudentContractService.csproj"

# Copy everything else and build
COPY ["backend/services/StudentContractService/", "backend/services/StudentContractService/"]
COPY ["DMS.Shared/", "DMS.Shared/"]

WORKDIR "/src/backend/services/StudentContractService"
RUN dotnet publish "StudentContractService.csproj" -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8081
ENV ASPNETCORE_URLS=http://+:8081

ENTRYPOINT ["dotnet", "StudentContractService.dll"]
