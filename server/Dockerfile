FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build

WORKDIR /src

COPY server.csproj .
RUN dotnet restore server.csproj

COPY . .
RUN dotnet publish server.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 5274

ENV ASPNETCORE_URLS=http://+:5274

ENTRYPOINT ["dotnet", "server.dll"]
