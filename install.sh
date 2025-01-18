#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to print colored messages
print_message() {
    echo -e "${GREEN}==>${NC} $1"
}

print_error() {
    echo -e "${RED}Error:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}Warning:${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use sudo)"
    exit 1
fi

# Get domain name
read -p "Enter your domain name (e.g., example.com): " DOMAIN_NAME
if [ -z "$DOMAIN_NAME" ]; then
    print_error "Domain name is required"
    exit 1
fi

# Validate domain name format
if ! echo "$DOMAIN_NAME" | grep -qP '(?=^.{4,253}$)(^(?:[a-zA-Z0-9](?:(?:[a-zA-Z0-9\-]){0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$)'; then
    print_error "Invalid domain name format"
    exit 1
fi

# Ask for SSL configuration
read -p "Do you want to configure SSL using Let's Encrypt? (y/n): " SETUP_SSL
SETUP_SSL=${SETUP_SSL,,} # Convert to lowercase

# Ask for email for SSL certificate
if [ "$SETUP_SSL" = "y" ]; then
    read -p "Enter email address for SSL notifications: " SSL_EMAIL
    if [ -z "$SSL_EMAIL" ]; then
        print_error "Email is required for SSL setup"
        exit 1
    fi
fi

# Get server IP
SERVER_IP=$(hostname -I | cut -d' ' -f1)
print_message "Detected Server IP: $SERVER_IP"
print_message "Domain Name: $DOMAIN_NAME"

# Update system
print_message "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
print_message "Installing required packages..."
apt install -y curl git nginx nodejs npm mysql-server redis-server certbot python3-certbot-nginx build-essential

# Install Node.js 16.x
print_message "Installing Node.js 16.x..."
curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
apt install -y nodejs

# Install PM2 globally
print_message "Installing PM2..."
npm install -g pm2

# Create application directory
APP_DIR="/var/www/e-prabandhan"
print_message "Creating application directory: $APP_DIR"
mkdir -p $APP_DIR
chown -R $SUDO_USER:$SUDO_USER $APP_DIR

# Copy application files
print_message "Copying application files..."
cp -r * $APP_DIR/
chown -R $SUDO_USER:$SUDO_USER $APP_DIR

# Configure MySQL
print_message "Configuring MySQL..."
systemctl enable mysql
systemctl start mysql

# Secure MySQL installation
print_message "Securing MySQL installation..."
mysql_secure_installation

# Configure Nginx with domain
print_message "Configuring Nginx..."
cat > /etc/nginx/sites-available/e-prabandhan << EOL
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    # Frontend
    location / {
        root $APP_DIR/frontend/build;
        try_files \$uri \$uri/ /index.html;
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Content-Type-Options "nosniff";
    }

    # Admin Panel
    location /admin {
        alias $APP_DIR/admin-panel/build;
        try_files \$uri \$uri/ /admin/index.html;
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Content-Type-Options "nosniff";
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;
    gzip_disable "MSIE [1-6]\.";
}
EOL

# Enable Nginx site
ln -s /etc/nginx/sites-available/e-prabandhan /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Configure SSL if requested
if [ "$SETUP_SSL" = "y" ]; then
    print_message "Configuring SSL with Let's Encrypt..."
    certbot --nginx \
        --non-interactive \
        --agree-tos \
        --email "$SSL_EMAIL" \
        --domains "$DOMAIN_NAME,www.$DOMAIN_NAME" \
        --redirect

    # Add auto-renewal cron job
    echo "0 0 * * * root certbot renew --quiet" > /etc/cron.d/certbot-renew
fi

# Update frontend environment with domain
print_message "Updating frontend configuration..."
cat > $APP_DIR/frontend/.env << EOL
REACT_APP_API_URL=https://${DOMAIN_NAME}/api
REACT_APP_DOMAIN=${DOMAIN_NAME}
EOL

cat > $APP_DIR/admin-panel/.env << EOL
REACT_APP_API_URL=https://${DOMAIN_NAME}/api
REACT_APP_DOMAIN=${DOMAIN_NAME}
EOL

# Create PM2 ecosystem file
cat > $APP_DIR/ecosystem.config.js << EOL
module.exports = {
  apps: [
    {
      name: 'e-prabandhan-backend',
      cwd: '$APP_DIR/backend',
      script: 'server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        DOMAIN: '${DOMAIN_NAME}'
      }
    }
  ]
};
EOL

# Update backend environment
cat > $APP_DIR/backend/.env << EOL
NODE_ENV=production
PORT=5000
DOMAIN=${DOMAIN_NAME}
# Database configuration will be done during first run
EOL

# Setup application
print_message "Setting up application..."
cd $APP_DIR

# Install dependencies and build frontend
cd $APP_DIR/frontend
npm install
npm run build

# Install dependencies and build admin panel
cd $APP_DIR/admin-panel
npm install
npm run build

# Install backend dependencies
cd $APP_DIR/backend
npm install

# Start application with PM2
print_message "Starting application..."
pm2 start $APP_DIR/ecosystem.config.js
pm2 save
pm2 startup

# Create first-run marker
touch $APP_DIR/.first-run

print_message "Installation completed successfully!"
print_message "Please run 'npm run first-run' in the backend directory to complete the setup."

# Print next steps
cat << EOL

${GREEN}=== Next Steps ===${NC}

1. Update your domain's DNS settings:
   Add an A record pointing to: ${SERVER_IP}
   - ${DOMAIN_NAME} -> ${SERVER_IP}
   - www.${DOMAIN_NAME} -> ${SERVER_IP}

2. Complete the database setup:
   cd $APP_DIR/backend
   npm run first-run

3. Access your application:
   - Frontend: https://${DOMAIN_NAME}
   - Admin Panel: https://${DOMAIN_NAME}/admin
   - API: https://${DOMAIN_NAME}/api

${YELLOW}Note: DNS propagation may take up to 48 hours. SSL certificate will only work after DNS is properly configured.${NC}

${GREEN}=== Security Recommendations ===${NC}
1. Configure firewall (UFW):
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw allow 22
   sudo ufw enable

2. Set up regular backups
3. Keep the system updated regularly
4. Monitor server logs for suspicious activity

For support, please visit: https://github.com/your-org/e-prabandhan/issues
EOL
