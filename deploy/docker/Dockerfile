# Touchline Studio: one image per release. No npm install needed (no dependencies).
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 DB_PATH=/app/data/touchline.db
COPY --chown=node:node . .
RUN rm -rf deploy .env data backups && mkdir -p data backups && chown node:node data backups
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1
CMD ["node", "--no-warnings=ExperimentalWarning", "server.js"]
