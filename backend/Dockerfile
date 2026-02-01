FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies, including bcrypt compilation dependencies
RUN apk add --no-cache python3 make g++

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "src/app.js"]
