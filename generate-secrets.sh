#!/bin/bash

# Generate NEXTAUTH_SECRET for production
echo "🔐 Generating NEXTAUTH_SECRET..."

# Generate a 64-character random string
NEXTAUTH_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)

echo ""
echo "✅ Generated NEXTAUTH_SECRET:"
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo ""
echo "📋 Copy this line to your .env.production file"
echo ""
echo "🔒 Keep this secret safe and never commit it to git!"