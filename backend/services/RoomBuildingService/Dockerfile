FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["backend/services/RoomBuildingService/RoomBuildingService.csproj", "backend/services/RoomBuildingService/"]
RUN dotnet restore "backend/services/RoomBuildingService/RoomBuildingService.csproj"

# Copy everything else and build
COPY ["backend/services/RoomBuildingService/", "backend/services/RoomBuildingService/"]

WORKDIR "/src/backend/services/RoomBuildingService"
RUN dotnet publish "RoomBuildingService.csproj" -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8083
ENV ASPNETCORE_URLS=http://+:8083

ENTRYPOINT ["dotnet", "RoomBuildingService.dll"]
