#!/bin/bash

echo "🔍 Security Check for VuCar Project"
echo "=================================="

# Check for sensitive files
echo "📁 Checking for sensitive files..."
SENSITIVE_FILES=0

# Check for .env files
if [ -f ".env" ]; then
    echo "⚠️  WARNING: .env file found (should not be committed)"
    SENSITIVE_FILES=$((SENSITIVE_FILES + 1))
fi

# Check for key files
if ls *.pem *.key *.p12 2>/dev/null; then
    echo "⚠️  WARNING: Key files found"
    SENSITIVE_FILES=$((SENSITIVE_FILES + 1))
fi

# Check git history for sensitive content
echo "🔍 Checking git history for sensitive patterns..."
if git log --all --grep="password\|secret\|key\|token" --oneline | head -5; then
    echo "⚠️  WARNING: Potential sensitive content in commit messages"
    SENSITIVE_FILES=$((SENSITIVE_FILES + 1))
fi

# Check for hardcoded secrets in code
echo "🔍 Checking for hardcoded secrets..."
if grep -r "mongodb+srv://.*:.*@" . --exclude-dir=node_modules --exclude-dir=.git --exclude="security-check.sh" 2>/dev/null; then
    echo "⚠️  WARNING: MongoDB connection strings found in code"
    SENSITIVE_FILES=$((SENSITIVE_FILES + 1))
fi

if grep -r "sk_live_\|pk_live_\|access_token\|secret_key" . --exclude-dir=node_modules --exclude-dir=.git --exclude="security-check.sh" 2>/dev/null; then
    echo "⚠️  WARNING: Potential API keys found in code"
    SENSITIVE_FILES=$((SENSITIVE_FILES + 1))
fi

echo ""
if [ $SENSITIVE_FILES -eq 0 ]; then
    echo "✅ Security check passed! No sensitive files found."
else
    echo "❌ Security issues found: $SENSITIVE_FILES"
    echo ""
    echo "🔧 Recommended actions:"
    echo "1. Remove sensitive files from git: git rm --cached filename"
    echo "2. Add files to .gitignore"
    echo "3. Change any exposed passwords/keys"
    echo "4. Use environment variables for secrets"
fi

echo ""
echo "📋 Security Best Practices:"
echo "- Never commit .env files"
echo "- Use .env.example as templates"
echo "- Rotate exposed credentials immediately"
echo "- Use environment variables in production"