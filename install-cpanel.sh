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

# Get cPanel credentials
read -p "Enter cPanel username: " CPANEL_USER
read -s -p "Enter cPanel password: " CPANEL_PASS
echo
read -p "Enter cPanel domain (e.g., example.com): " CPANEL_DOMAIN
read -p "Enter cPanel port (default: 2083): " CPANEL_PORT
CPANEL_PORT=${CPANEL_PORT:-2083}

# Get application domain
read -p "Enter domain for e-Prabandhan (e.g., app.example.com): " APP_DOMAIN
read -p "Enter application directory name (default: e-prabandhan): " APP_DIR
APP_DIR=${APP_DIR:-e-prabandhan}

# Get database details
read -p "Enter database name (default: ${CPANEL_USER}_eprabandhan): " DB_NAME
DB_NAME=${DB_NAME:-${CPANEL_USER}_eprabandhan}
read -p "Enter database user (default: ${CPANEL_USER}_epruser): " DB_USER
DB_USER=${DB_USER:-${CPANEL_USER}_epruser}
read -s -p "Enter database password: " DB_PASS
echo

# Base URL for cPanel API
CPANEL_API="https://$CPANEL_DOMAIN:$CPANEL_PORT/execute"

# Function to make cPanel API calls
cpanel_api() {
    local module=$1
    local function=$2
    local data=$3
    
    curl -s -k -H "Authorization: Basic $(echo -n "$CPANEL_USER:$CPANEL_PASS" | base64)" \
         -X POST \
         -H "Content-Type: application/json" \
         -d "$data" \
         "$CPANEL_API/$module/$function"
}

# Create MySQL Database
print_message "Creating MySQL Database..."
cpanel_api "MySQL" "create_database" "{\"name\": \"$DB_NAME\"}"

# Create Database User
print_message "Creating Database User..."
cpanel_api "MySQL" "create_user" "{\"name\": \"$DB_USER\", \"password\": \"$DB_PASS\"}"

# Grant User Privileges
print_message "Granting Database Privileges..."
cpanel_api "MySQL" "set_privileges_on_database" "{\"user\": \"$DB_USER\", \"database\": \"$DB_NAME\", \"privileges\": \"ALL PRIVILEGES\"}"

# Create Application Directory
print_message "Creating Application Directory..."
cpanel_api "Filesystem" "create_directory" "{\"path\": \"public_html/$APP_DIR\"}"

# Create Subdomain
print_message "Creating Subdomain..."
SUBDOMAIN=$(echo $APP_DOMAIN | cut -d'.' -f1)
DOMAIN=$(echo $APP_DOMAIN | cut -d'.' -f2-)
cpanel_api "SubDomain" "addsubdomain" "{\"domain\": \"$SUBDOMAIN\", \"rootdomain\": \"$DOMAIN\", \"dir\": \"public_html/$APP_DIR\"}"

# Create Node.js Application
print_message "Creating Node.js Application..."
cpanel_api "NodeApp" "create" "{\"domain\": \"$APP_DOMAIN\", \"path\": \"public_html/$APP_DIR\", \"backend_path\": \"backend/server.js\"}"

# Upload Application Files
print_message "Uploading Application Files..."
cd ..
zip -r e-prabandhan.zip e-prabandhan/* -x "*.git*"
curl -k -T e-prabandhan.zip "ftp://$CPANEL_DOMAIN/public_html/$APP_DIR/" --user "$CPANEL_USER:$CPANEL_PASS"

# Extract Files
print_message "Extracting Files..."
cpanel_api "Filesystem" "extract_file" "{\"path\": \"public_html/$APP_DIR/e-prabandhan.zip\", \"extract_to\": \"public_html/$APP_DIR\"}"

# Configure Environment Files
print_message "Configuring Environment Files..."

# Backend .env
cat > backend/.env << EOL
NODE_ENV=production
PORT=5000
DOMAIN=$APP_DOMAIN

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS
DB_NAME=$DB_NAME

# JWT Configuration
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=24h

# Email Configuration
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=$CPANEL_USER
SMTP_PASS=$CPANEL_PASS
SMTP_FROM=noreply@$APP_DOMAIN
EOL

# Frontend .env
cat > frontend/.env << EOL
REACT_APP_API_URL=https://$APP_DOMAIN/api
REACT_APP_DOMAIN=$APP_DOMAIN
EOL

# Admin Panel .env
cat > admin-panel/.env << EOL
REACT_APP_API_URL=https://$APP_DOMAIN/api
REACT_APP_DOMAIN=$APP_DOMAIN
EOL

# Upload Environment Files
curl -k -T backend/.env "ftp://$CPANEL_DOMAIN/public_html/$APP_DIR/backend/" --user "$CPANEL_USER:$CPANEL_PASS"
curl -k -T frontend/.env "ftp://$CPANEL_DOMAIN/public_html/$APP_DIR/frontend/" --user "$CPANEL_USER:$CPANEL_PASS"
curl -k -T admin-panel/.env "ftp://$CPANEL_DOMAIN/public_html/$APP_DIR/admin-panel/" --user "$CPANEL_USER:$CPANEL_PASS"

# Install Dependencies and Build
print_message "Installing Dependencies and Building Application..."
cpanel_api "NodeApp" "install_dependencies" "{\"domain\": \"$APP_DOMAIN\", \"path\": \"public_html/$APP_DIR/backend\"}"
cpanel_api "NodeApp" "install_dependencies" "{\"domain\": \"$APP_DOMAIN\", \"path\": \"public_html/$APP_DIR/frontend\"}"
cpanel_api "NodeApp" "install_dependencies" "{\"domain\": \"$APP_DOMAIN\", \"path\": \"public_html/$APP_DIR/admin-panel\"}"

# Build Frontend and Admin Panel
cpanel_api "NodeApp" "run_script" "{\"domain\": \"$APP_DOMAIN\", \"path\": \"public_html/$APP_DIR/frontend\", \"script\": \"build\"}"
cpanel_api "NodeApp" "run_script" "{\"domain\": \"$APP_DOMAIN\", \"path\": \"public_html/$APP_DIR/admin-panel\", \"script\": \"build\"}"

# Configure Apache for Frontend and Admin Panel
cat > .htaccess << EOL
RewriteEngine On
RewriteBase /

# Frontend Routes
RewriteCond %{REQUEST_URI} !^/admin
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Admin Panel Routes
RewriteCond %{REQUEST_URI} ^/admin
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^admin/(.*)$ /admin/index.html [L]

# Security Headers
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"
Header set X-Frame-Options "SAMEORIGIN"
Header set Referrer-Policy "same-origin"
Header set Strict-Transport-Security "max-age=31536000; includeSubDomains"
EOL

curl -k -T .htaccess "ftp://$CPANEL_DOMAIN/public_html/$APP_DIR/" --user "$CPANEL_USER:$CPANEL_PASS"

# Start Node.js Application
print_message "Starting Application..."
cpanel_api "NodeApp" "start" "{\"domain\": \"$APP_DOMAIN\", \"path\": \"public_html/$APP_DIR/backend\"}"

# Create SSL Certificate
print_message "Setting up SSL Certificate..."
cpanel_api "SSL" "install_ssl" "{\"domain\": \"$APP_DOMAIN\", \"type\": \"autossl\"}"

print_message "Installation Complete!"
cat << EOL

${GREEN}=== Installation Summary ===${NC}
Application URL: https://$APP_DOMAIN
Admin Panel URL: https://$APP_DOMAIN/admin
API URL: https://$APP_DOMAIN/api

${GREEN}=== Database Details ===${NC}
Database Name: $DB_NAME
Database User: $DB_USER
Database Host: localhost

${YELLOW}=== Important Notes ===${NC}
1. SSL certificate may take a few hours to propagate
2. Make sure to update your DNS records:
   Add an A record for $APP_DOMAIN pointing to your server IP

${GREEN}=== Next Steps ===${NC}
1. Access the application at https://$APP_DOMAIN
2. Complete the first-run setup through the web interface
3. Create your admin account
4. Configure email settings in cPanel if needed

${RED}=== Security Recommendations ===${NC}
1. Change the database password regularly
2. Enable two-factor authentication in cPanel
3. Keep regular backups using cPanel's backup feature
4. Monitor error logs in cPanel's error log viewer

For support, please visit: https://github.com/your-org/e-prabandhan/issues
EOL
