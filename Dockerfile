FROM node:22-bookworm-slim AS web-build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY apps ./apps
COPY public ./public
COPY index.html vite.config.js ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0-noble AS backend-build
WORKDIR /src
COPY services ./services
RUN dotnet publish services/gateway/src/SGCoffee.Gateway/SGCoffee.Gateway.csproj -c Release -o /out/gateway -p:UseAppHost=false
RUN dotnet publish services/analytics/src/SGCoffee.Analytics/SGCoffee.Analytics.csproj -c Release -o /out/analytics -p:UseAppHost=false
RUN dotnet publish services/catalog/src/SGCoffee.Catalog/SGCoffee.Catalog.csproj -c Release -o /out/catalog -p:UseAppHost=false
RUN dotnet publish services/submission/src/SGCoffee.Submission/SGCoffee.Submission.csproj -c Release -o /out/submission -p:UseAppHost=false
RUN dotnet publish services/localization/SGCoffee.Localization.csproj -c Release -o /out/localization -p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble
WORKDIR /app
COPY --from=web-build /usr/local/bin/node /usr/local/bin/node
COPY --from=web-build /src/dist ./dist
COPY --from=backend-build /out ./services
COPY scripts ./scripts
ENV NODE_ENV=production ASPNETCORE_ENVIRONMENT=Production DOTNET_EnableDiagnostics=0
EXPOSE 8080
CMD ["node", "scripts/start-all.mjs"]
