FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["YouTubeChannelLibrary.API.csproj", "./"]
RUN dotnet restore "YouTubeChannelLibrary.API.csproj"
COPY . .
RUN dotnet build "YouTubeChannelLibrary.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "YouTubeChannelLibrary.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create a non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

ENTRYPOINT ["dotnet", "YouTubeChannelLibrary.API.dll"]
