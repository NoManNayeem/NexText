FROM node:23

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and env
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port for production
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
