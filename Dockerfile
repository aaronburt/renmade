FROM node:22-alpine
LABEL org.opencontainers.image.description "Modular and feature-rich Discord bot powered by Node 22 and Gemini AI"
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
RUN npm ci --only=production
COPY --chown=node:node src/ ./src/
RUN mkdir -p data && chown -R node:node data
USER node
CMD ["node", "src/index.js"]
