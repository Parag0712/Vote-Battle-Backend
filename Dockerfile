FROM node:20-alpine

# Install OpenSSL since Prisma needs it
RUN apk add --no-cache openssl

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Copy Prisma schema first - this is important!
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Your environment variables
COPY .env ./.env

RUN npm run build
CMD ["npm", "run", "start"]

