FROM node:latest

ENV NODE_ENV=production
ENV HOST 0.0.0.0
ENV PORT 80

ENV APP_ROOT /app

RUN mkdir -p ${APP_ROOT}
WORKDIR ${APP_ROOT}

COPY package.json ${APP_ROOT}
RUN npm install
RUN apt-get update && apt-get install -y python3 python3-dev python3-pip python3-setuptools && pip3 install glances
COPY . ${APP_ROOT}

# Expose the app port
EXPOSE 80

RUN npm run build
CMD ["npm", "start"]

# Glances
COPY glances.conf /app/glances.conf
CMD ["glances -C /app/glances.conf --export mqtt"]
