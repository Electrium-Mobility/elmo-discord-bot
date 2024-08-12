#!/bin/bash

# Run npm install
npm install

# Run deploy-commands.js
node deploy-commands.js

# Start the bot
node .  