FROM mcr.microsoft.com/dotnet/core/aspnet:3.1 AS base
WORKDIR /output
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build
WORKDIR /src
COPY backend/Whale.API/ Whale.API/
COPY backend/Whale.BLL/ Whale.BLL/
COPY backend/Whale.DAL/ Whale.DAL/
COPY backend/Whale.Shared/ Whale.Shared/
WORKDIR Whale.API
RUN dotnet publish -c Release -o output

FROM base AS final
COPY --from=build /src/Whale.API/output .
ENV ASPNETCORE_URLS=http://+:4201
ENTRYPOINT ["dotnet", "Whale.API.dll"]
