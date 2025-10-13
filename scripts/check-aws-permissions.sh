#!/bin/bash
# Script kiểm tra và setup IAM permissions cho Parameter Store

echo "🔍 Kiểm tra quyền truy cập AWS Parameter Store..."

# Kiểm tra AWS CLI
if ! command -v aws &> /dev/null; then
    echo "📦 Cài đặt AWS CLI..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
fi

# Kiểm tra AWS credentials/role
echo "🔐 Kiểm tra AWS credentials..."
if aws sts get-caller-identity > /dev/null 2>&1; then
    echo "✅ AWS credentials OK"
    aws sts get-caller-identity
else
    echo "❌ AWS credentials không được cấu hình"
    echo ""
    echo "📋 Hướng dẫn cấu hình:"
    echo "1. Tạo IAM Role với policy SSMParameterReadWrite"
    echo "2. Attach role vào EC2 instance"
    echo "3. Hoặc chạy: aws configure"
    echo ""
    exit 1
fi

# Test quyền truy cập Parameter Store
echo "🧪 Test quyền truy cập Parameter Store..."
if aws ssm describe-parameters --max-items 1 > /dev/null 2>&1; then
    echo "✅ Parameter Store access OK"
else
    echo "❌ Không có quyền truy cập Parameter Store"
    echo ""
    echo "📋 Cần IAM permissions:"
    echo "- ssm:GetParameter"
    echo "- ssm:GetParameters" 
    echo "- ssm:PutParameter"
    echo "- ssm:DeleteParameter"
    echo "- kms:Decrypt (cho SecureString)"
    echo ""
    exit 1
fi

echo "🎉 AWS Parameter Store đã sẵn sàng!"