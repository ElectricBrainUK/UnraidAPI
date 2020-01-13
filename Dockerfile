FROM node:latest

ENV NODE_ENV=production
ENV HOST 0.0.0.0
ENV PORT 80

ENV APP_ROOT /app

RUN mkdir -p ${APP_ROOT}
COPY . ${APP_ROOT}
WORKDIR ${APP_ROOT}

COPY package.json ${APP_ROOT}
RUN npm install
RUN apt-get update && apt-get install -y glances
COPY . ${APP_ROOT}

# Expose the app port
EXPOSE 80

RUN npm run build
CMD ["npm", "start"]
