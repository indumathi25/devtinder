FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies, including bcrypt compilation dependencies if needed
# Alpine might need python3 and make g++ for some native modules, but pure bcrypt usually has binaries.
# If issues arise, we can uncomment:
# RUN apk add --no-cache python3 make g++

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "src/app.js"]
