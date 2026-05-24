FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY server.csproj .
RUN dotnet restore server.csproj

COPY . .
RUN dotnet publish server.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENV ASPNETCORE_HTTP_PORTS=8080

ENTRYPOINT ["dotnet", "server.dll"]
