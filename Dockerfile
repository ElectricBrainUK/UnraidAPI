FROM node:latest

ENV NODE_ENV=production
ENV HOST 0.0.0.0
ENV PORT 80
ENV NODE_OPTIONS="--max_old_space_size=256"

ENV APP_ROOT /app

RUN mkdir -p ${APP_ROOT}
COPY . ${APP_ROOT}
WORKDIR ${APP_ROOT}
# Expose the app port
EXPOSE 80

RUN npm install
RUN npm run build
CMD ["npm", "start"]
