FROM node:latest

ENV NODE_ENV=production
ENV HOST 0.0.0.0
ENV PORT 3005

ENV APP_ROOT /app

RUN mkdir -p ${APP_ROOT}
COPY . ${APP_ROOT}
WORKDIR ${APP_ROOT}
# Expose the app port
EXPOSE 3005

RUN npm install
RUN npm run build
CMD ["npm", "start"]