FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_OPTIONS="--max_old_space_size=4049"


RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
