#!/bin/bash

# Create output directory and ensure proper permissions
mkdir -p /app/output
chmod 755 /app/output

# Copy the index.html to output directory
cp -f /app/output/index.html /app/output/index.html

# Start the Python HTTP server in the background
cd /app/output && python3 -m http.server 8000 &

# Start the Node.js server in the background
cd /app && node server.js &

# Wait for the servers to start
sleep 5

# Run the Python client
python3 client.py

# Keep the container running
wait