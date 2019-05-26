FROM node:10.15.3
RUN mkdir /app
WORKDIR /app
COPY ./backend-js/package.json /app
RUN npm install
COPY ./backend-js /app
EXPOSE 8080
CMD ["npm","start"]