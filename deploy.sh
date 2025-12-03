#!/bin/bash

# ========================================
# YouTube Channel Library - Deployment Script
# For Ubuntu 24.04 without Email Service
# ========================================

set -e  # Exit on any error

echo "🚀 Starting YouTube Channel Library Deployment"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# ========================================
# STEP 1: Update System
# ========================================
echo "📦 Step 1: Updating system packages..."
sudo apt update
sudo apt upgrade -y
print_status "System updated"
echo ""

# ========================================
# STEP 2: Install Docker
# ========================================
echo "🐳 Step 2: Installing Docker..."

if command -v docker &> /dev/null; then
    print_warning "Docker is already installed"
else
    # Install prerequisites
    sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    print_status "Docker installed successfully"
fi
echo ""

# ========================================
# STEP 3: Install Docker Compose
# ========================================
echo "🐙 Step 3: Installing Docker Compose..."

if command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose is already installed"
else
    # Install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    print_status "Docker Compose installed successfully"
fi
echo ""

# ========================================
# STEP 4: Configure Firewall
# ========================================
echo "🔥 Step 4: Configuring firewall..."

sudo ufw allow 22/tcp     # SSH
sudo ufw allow 3000/tcp   # Frontend
sudo ufw allow 5053/tcp   # Backend API
sudo ufw --force enable

print_status "Firewall configured"
echo ""

# ========================================
# STEP 5: Setup Project Directory
# ========================================
echo "📁 Step 5: Setting up project directory..."

PROJECT_DIR="/root/youtubefa"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

print_status "Project directory created at: $PROJECT_DIR"
echo ""

# ========================================
# STEP 6: Check for Project Files
# ========================================
echo "📄 Step 6: Checking for project files..."

if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found!"
    echo "Please upload your project files to: $PROJECT_DIR"
    echo ""
    echo "Required files:"
    echo "  - docker-compose.yml"
    echo "  - .env"
    echo "  - backend/ (directory with Dockerfile)"
    echo "  - frontend/ (directory with Dockerfile)"
    exit 1
fi

print_status "docker-compose.yml found"

if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    echo ""
    echo "Creating .env template..."
    
    cat > .env << 'EOF'
# Database Configuration
DB_PASSWORD=YourStrong!Passw0rd123
DB_CONNECTION_STRING=Server=db;Database=YouTubeChannelDb;User Id=sa;Password=YourStrong!Passw0rd123;TrustServerCertificate=True;

# JWT Secret (generate new: openssl rand -base64 64)
JWT_SECRET=YZTes0zp+btpDmhR+cSuMIj12MG2jTBHnkZaWAVuJG3ngR44FeaXFnjHZJydLw97Ta2NJzCyeS6MbahzjL99sn355HcPzRspXCp7NlzIs6qoa7TY0Sq4CNpd8CPx0aC5XI/mihZTYfhmJJXYno0BbviRqdxBfkDHwNw94cthS5o=

# YouTube API Key
YOUTUBE_API_KEY=AIzaSyAxchoUG5jq52lbw009Z-secVa79BAF_iA

# URLs (replace YOUR_SERVER_IP with your actual IP)
FRONTEND_URL=http://YOUR_SERVER_IP:3000
API_URL=http://YOUR_SERVER_IP:5053
EOF
    
    print_warning ".env file created. PLEASE EDIT IT WITH YOUR VALUES!"
    echo ""
    echo "Edit .env with: nano .env"
    echo "Replace YOUR_SERVER_IP with your server's public IP"
    echo ""
    read -p "Press Enter after you've edited .env..."
fi

print_status ".env file exists"
echo ""

# ========================================
# STEP 7: Get Server IP
# ========================================
echo "🌐 Step 7: Detecting server IP..."

SERVER_IP=$(curl -s ifconfig.me)
if [ -z "$SERVER_IP" ]; then
    SERVER_IP=$(hostname -I | awk '{print $1}')
fi

print_status "Server IP: $SERVER_IP"
echo ""

print_warning "Make sure your .env file has the correct IP:"
echo "  FRONTEND_URL=http://$SERVER_IP:3000"
echo "  API_URL=http://$SERVER_IP:5053"
echo ""
read -p "Press Enter to continue..."
echo ""

# ========================================
# STEP 8: Build Docker Images
# ========================================
echo "🔨 Step 8: Building Docker images..."
echo "This may take 5-10 minutes..."
echo ""

docker-compose build --no-cache

print_status "Docker images built successfully"
echo ""

# ========================================
# STEP 9: Start Services
# ========================================
echo "🚀 Step 9: Starting services..."

docker-compose up -d

print_status "Services started"
echo ""

# ========================================
# STEP 10: Wait for Services to be Ready
# ========================================
echo "⏳ Step 10: Waiting for services to be ready..."
echo "This may take 30-60 seconds..."
echo ""

sleep 10

# Check database
echo "Checking database..."
for i in {1..30}; do
    if docker-compose exec -T db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "${DB_PASSWORD:-YourStrong!Passw0rd123}" -Q "SELECT 1" &> /dev/null; then
        print_status "Database is ready"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

# Check API
echo "Checking API..."
for i in {1..30}; do
    if curl -s http://localhost:5053/health &> /dev/null; then
        print_status "API is ready"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

# Check Frontend
echo "Checking Frontend..."
for i in {1..30}; do
    if curl -s http://localhost:3000 &> /dev/null; then
        print_status "Frontend is ready"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

# ========================================
# STEP 11: Show Status
# ========================================
echo "📊 Step 11: Service Status"
echo "=========================="
docker-compose ps
echo ""

# ========================================
# DEPLOYMENT COMPLETE
# ========================================
echo "================================================"
echo -e "${GREEN}✓ DEPLOYMENT COMPLETE!${NC}"
echo "================================================"
echo ""
echo "🌐 Your application is now running:"
echo "   Frontend: http://$SERVER_IP:3000"
echo "   API:      http://$SERVER_IP:5053"
echo ""
echo "📋 Useful Commands:"
echo "   View logs:        docker-compose logs -f"
echo "   Stop services:    docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   View status:      docker-compose ps"
echo ""
echo "🔧 Troubleshooting:"
echo "   If services aren't accessible, check:"
echo "   1. Firewall: sudo ufw status"
echo "   2. Docker logs: docker-compose logs"
echo "   3. Container status: docker ps"
echo ""
echo "📝 Next Steps:"
echo "   1. Test the frontend at http://$SERVER_IP:3000"
echo "   2. Register an admin account"
echo "   3. Start adding YouTube channels!"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "   - Change the DB_PASSWORD in .env"
echo "   - Generate a new JWT_SECRET"
echo "   - Set up HTTPS with a reverse proxy (Nginx + Let's Encrypt)"
echo "   - Never commit .env to version control"
echo ""