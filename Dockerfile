FROM node:12.18.3-alpine3.12

LABEL author="Tom Rooman"

# Create Directory for the Container
WORKDIR /home/node/app

# Copy all files to work directory
COPY . .

# Install all Packages
RUN yarn

# Start
CMD [ "yarn", "start-log" ]
