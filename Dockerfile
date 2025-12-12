FROM node:20-alpine

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm install

COPY backend/ ./

# Install nginx
RUN apk add --no-cache nginx

# Copy frontend files to nginx html directory
COPY frontend/ /usr/share/nginx/html/

# Create nginx config template
RUN mkdir -p /run/nginx

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'cat > /etc/nginx/http.d/default.conf <<EOF' >> /app/start.sh && \
    echo 'server {' >> /app/start.sh && \
    echo '    listen 443 ssl;' >> /app/start.sh && \
    echo '    ssl_certificate /app/certs/SSLcertificate.crt;' >> /app/start.sh && \
    echo '    ssl_certificate_key /app/certs/SSLprivatekey.key;' >> /app/start.sh && \
    echo '    root /usr/share/nginx/html;' >> /app/start.sh && \
    echo '    index index.html;' >> /app/start.sh && \
    echo '    location / {' >> /app/start.sh && \
    echo '        try_files \$uri \$uri/ /index.html;' >> /app/start.sh && \
    echo '    }' >> /app/start.sh && \
    echo '    location /api/ {' >> /app/start.sh && \
    echo '        proxy_pass http://localhost:3000/api/;' >> /app/start.sh && \
    echo '        proxy_http_version 1.1;' >> /app/start.sh && \
    echo '        proxy_set_header Upgrade \$http_upgrade;' >> /app/start.sh && \
    echo '        proxy_set_header Connection "upgrade";' >> /app/start.sh && \
    echo '        proxy_set_header Host \$host;' >> /app/start.sh && \
    echo '        proxy_cache_bypass \$http_upgrade;' >> /app/start.sh && \
    echo '    }' >> /app/start.sh && \
    echo '}' >> /app/start.sh && \
    echo 'EOF' >> /app/start.sh && \
    echo 'npm run start &' >> /app/start.sh && \
    echo 'sleep 2' >> /app/start.sh && \
    echo 'nginx -g "daemon off;"' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 443

CMD ["/bin/sh", "/app/start.sh"]
