FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["backend/services/Gateway/Gateway.csproj", "backend/services/Gateway/"]
RUN dotnet restore "backend/services/Gateway/Gateway.csproj"

# Copy everything else and build
COPY ["backend/services/Gateway/", "backend/services/Gateway/"]

WORKDIR "/src/backend/services/Gateway"
RUN dotnet publish "Gateway.csproj" -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000

ENTRYPOINT ["dotnet", "Gateway.dll"]
