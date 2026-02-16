FROM node:18-alpine

# 1. Set the working directory inside the container
WORKDIR /usr/src/app

# 2. Copy the manifest files
COPY package*.json ./

# 3. Install only the necessary dependencies
RUN npm install --production

# 4. Copy the rest of the project (this includes your /public folder)
COPY . .

# 5. Tell Docker which port the internal app is using
EXPOSE 4000

# 6. Start the server directly
CMD [ "node", "server.js" ]
