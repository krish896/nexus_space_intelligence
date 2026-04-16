FROM node:lts-alpine

# Set the working directory which is basically where all your code will reside inside the container
WORKDIR /app

# copying all files from current directory to working directory in container
# rn we are copying everything and then installing dependencies inc node_modules as alpine will need diff node_modules so we shd not copy the node_modules from host to container
COPY package*.json ./ 

COPY client/package*.json client/
RUN npm run install-client 

COPY server/package*.json server/
RUN npm run install-server --omit=dev

COPY client/ client/
RUN npm run build --prefix client

COPY server/ server/ 

# switch to a non-root user for better security
USER node

# what to do when the container is started
CMD ["npm", "start", "--prefix", "server"]

# Expose the port the app runs on
EXPOSE 8001