#!/bin/bash
# MongoDB Atlas Production Setup Guide

echo "🍃 MongoDB Atlas Production Setup Guide"
echo "========================================"

cat << 'EOF'

This script will guide you through setting up a production MongoDB Atlas cluster for VuCar.

📋 Prerequisites:
1. MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)
2. Atlas CLI installed (optional but recommended)
3. Network access configured for your production server

🚀 Setup Steps:

1. CREATE PRODUCTION CLUSTER:
   ----------------------------
   • Login to MongoDB Atlas (https://cloud.mongodb.com)
   • Click "Create" → "Database"
   • Choose "Dedicated" for production
   • Select:
     - Cloud Provider: AWS (recommended)
     - Region: US East (N. Virginia) us-east-1 (or closest to your EC2)
     - Cluster Tier: M10 or higher for production
     - Cluster Name: "vucar-production"

2. CONFIGURE NETWORK ACCESS:
   --------------------------
   • Go to "Network Access" → "Add IP Address"
   • Add your production server's IP address
   • Description: "VuCar Production Server"
   
   To find your EC2 instance IP:
   $ curl -s http://checkip.amazonaws.com/

3. CREATE DATABASE USER:
   ----------------------
   • Go to "Database Access" → "Add New Database User"
   • Authentication Method: Password
   • Username: vucar-prod-user
   • Password: [Generate strong password]
   • Database User Privileges: "Read and write to any database"

4. GET CONNECTION STRING:
   -----------------------
   • Go to "Database" → "Connect" → "Connect your application"
   • Driver: Node.js, Version: 4.1 or later
   • Copy the connection string (looks like):
   
   mongodb+srv://vucar-prod-user:<password>@vucar-production.xxxxx.mongodb.net/?retryWrites=true&w=majority

5. UPDATE PRODUCTION ENVIRONMENT:
   -------------------------------
   • Replace <password> with your actual password
   • Add database name to the URL: /vucar_production
   
   Final format:
   mongodb+srv://vucar-prod-user:YOUR_PASSWORD@vucar-production.xxxxx.mongodb.net/vucar_production?retryWrites=true&w=majority

6. CONFIGURE ENVIRONMENT VARIABLES:
   ---------------------------------
   Update your .env.production file:

MONGODB_URL=mongodb+srv://vucar-prod-user:YOUR_PASSWORD@vucar-production.xxxxx.mongodb.net/vucar_production?retryWrites=true&w=majority

7. OPTIONAL - ATLAS CLI SETUP:
   ----------------------------
   If you want to manage Atlas from command line:
   
   # Install Atlas CLI
   $ brew install mongodb-atlas-cli  # macOS
   # or
   $ curl -fLo atlas https://github.com/mongodb/mongodb-atlas-cli/releases/latest/download/atlas_linux_x86_64.tar.gz
   
   # Login
   $ atlas auth login
   
   # List clusters
   $ atlas clusters list

8. SECURITY RECOMMENDATIONS:
   -------------------------
   • Enable MongoDB Atlas backup (automatic in M10+)
   • Set up monitoring and alerts
   • Regularly rotate database passwords
   • Use MongoDB Atlas Data API for additional security
   • Enable audit logs (Atlas M10+)

9. PERFORMANCE OPTIMIZATION:
   --------------------------
   • Create indexes for your collections:
     db.cars.createIndex({ "createdAt": -1 })
     db.cars.createIndex({ "status": 1 })
     db.inspections.createIndex({ "carId": 1 })
     db.criteria.createIndex({ "category": 1 })
   
   • Enable connection pooling in your app (already configured in Next.js)
   • Monitor slow queries in Atlas Performance Advisor

10. BACKUP STRATEGY:
    ----------------
    • Atlas automatic backups (included in M10+)
    • Set backup schedule: Daily snapshots, 7-day retention
    • Test restore procedures regularly

📊 Estimated Costs (M10 Cluster):
• M10 Dedicated: ~$57/month
• Data Transfer: ~$0.10/GB
• Backup: Included
• Total: ~$60-80/month depending on usage

🔧 Connection Testing:
After setup, test your connection:

node -e "
const { MongoClient } = require('mongodb');
const uri = 'YOUR_CONNECTION_STRING_HERE';
const client = new MongoClient(uri);
async function test() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas!');
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Database ping successful!');
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await client.close();
  }
}
test();
"

🚨 IMPORTANT SECURITY NOTES:
• Never commit your production connection string to Git
• Use environment variables for all sensitive data
• Regularly rotate passwords and API keys
• Monitor database access logs
• Set up alerting for unusual activity

📞 Support:
• MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
• MongoDB Community: https://community.mongodb.com/
• Atlas Support: Available in M10+ clusters

EOF

echo ""
echo "🎯 Next Steps:"
echo "1. Complete the MongoDB Atlas setup above"
echo "2. Update your .env.production file with the connection string"
echo "3. Test the connection using the provided Node.js script"
echo "4. Run the deployment script to deploy to production"
echo ""
echo "Would you like me to help you with any specific step? (y/N)"
read -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Choose what you need help with:"
    echo "1. Generate .env.production template"
    echo "2. Create database indexes script"
    echo "3. Connection test script"
    echo "4. Exit"
    echo ""
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            echo "Creating .env.production template..."
            cat > .env.production.new << 'ENVEOF'
# MongoDB Atlas Production Configuration
MONGODB_URL=mongodb+srv://vucar-prod-user:YOUR_PASSWORD@vucar-production.xxxxx.mongodb.net/vucar_production?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=https://vucar.syledevops.live
NEXTAUTH_SECRET=your-super-secret-nextauth-secret-at-least-32-characters-long

# Application Configuration
NODE_ENV=production
APP_VERSION=1.0.0

# Docker Configuration (for Jenkins)
DOCKER_REGISTRY=docker.io
DOCKER_IMAGE_NAME=syle712/vucar-app
DOCKER_TAG=latest

# Security
BCRYPT_ROUNDS=12
JWT_SECRET=your-jwt-secret-key-for-api-tokens

# Email Configuration (if using)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-smtp-password

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn-for-error-tracking
ANALYTICS_ID=your-analytics-id
ENVEOF
            echo "✅ Created .env.production.new - rename to .env.production and update values"
            ;;
        2)
            echo "Creating database indexes script..."
            cat > create-indexes.js << 'JSEOF'
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URL || 'your-connection-string-here';
const client = new MongoClient(uri);

async function createIndexes() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db('vucar_production');
    
    // Cars collection indexes
    await db.collection('cars').createIndex({ "createdAt": -1 });
    await db.collection('cars').createIndex({ "status": 1 });
    await db.collection('cars').createIndex({ "model": 1, "make": 1 });
    console.log('✅ Cars indexes created');
    
    // Inspections collection indexes
    await db.collection('inspections').createIndex({ "carId": 1 });
    await db.collection('inspections').createIndex({ "createdAt": -1 });
    await db.collection('inspections').createIndex({ "status": 1 });
    console.log('✅ Inspections indexes created');
    
    // Criteria collection indexes
    await db.collection('criteria').createIndex({ "category": 1 });
    await db.collection('criteria').createIndex({ "active": 1 });
    console.log('✅ Criteria indexes created');
    
    console.log('🎉 All indexes created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await client.close();
  }
}

createIndexes();
JSEOF
            echo "✅ Created create-indexes.js - run with: node create-indexes.js"
            ;;
        3)
            echo "Creating connection test script..."
            cat > test-db-connection.js << 'JSEOF'
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URL || 'your-connection-string-here';
const client = new MongoClient(uri);

async function testConnection() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Test ping
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Database ping successful!');
    
    // Get database info
    const db = client.db('vucar_production');
    const stats = await db.stats();
    console.log(`📊 Database: ${stats.db}`);
    console.log(`📊 Collections: ${stats.collections}`);
    console.log(`📊 Data Size: ${Math.round(stats.dataSize / 1024)} KB`);
    
    // Test write operation
    const testCollection = db.collection('connection_test');
    await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'Connection test successful' 
    });
    console.log('✅ Write test successful!');
    
    // Clean up test document
    await testCollection.deleteOne({ test: true });
    console.log('✅ Cleanup successful!');
    
    console.log('🎉 All connection tests passed!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('👋 Connection closed');
  }
}

testConnection();
JSEOF
            echo "✅ Created test-db-connection.js - run with: node test-db-connection.js"
            ;;
        4)
            echo "👋 Goodbye!"
            ;;
        *)
            echo "Invalid choice"
            ;;
    esac
fi

echo ""
echo "📚 Documentation created successfully!"
echo "Files available:"
echo "- MongoDB Atlas setup guide (this output)"
echo "- .env.production.new (if generated)"
echo "- create-indexes.js (if generated)"
echo "- test-db-connection.js (if generated)"