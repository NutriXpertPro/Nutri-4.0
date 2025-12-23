FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

# Install dependencies (including devDependencies for build)
RUN npm ci

COPY . .

# Build the Next.js application
RUN npm run build

# Set production environment
ENV NODE_ENV production

# Start the application
CMD ["npm", "start"]
