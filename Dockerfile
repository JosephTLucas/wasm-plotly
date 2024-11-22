# Use Node.js base image
FROM node:20-slim

# Install Python and required packages
RUN apt-get update && apt-get install -y \
    python3-full \
    python3-pip \
    python3-venv \
    # Required for Playwright
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libatspi2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    # Required for cairosvg
    libcairo2-dev \
    libgirepository1.0-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Create and activate virtual environment
ENV VIRTUAL_ENV=/app/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Install Playwright browser
RUN npx playwright install chromium --with-deps

# Copy server code
COPY server.js ./
COPY server_debug.py ./

# Copy Python requirements and install them
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Create output directory and copy viewer
COPY output/index.html ./output/

COPY client_plot.html ./

# Copy Python client
COPY client.py ./

# Add start script
COPY start.sh ./
RUN chmod +x start.sh

# Create output directory
RUN mkdir -p output

# Expose the ports
EXPOSE 3000
EXPOSE 8000

# Start both server and client
CMD ["./start.sh"]