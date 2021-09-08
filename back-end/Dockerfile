FROM node:latest
# FROM nginx

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .
# COPY / /usr/share/nginx/html
# COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# RUN sed -i "s/mongodb:\/\/localhost/mongodb:\/\/mongo/g" common/services/mongoose.service.js

RUN npm install

CMD ["npm", "run", "start"]
