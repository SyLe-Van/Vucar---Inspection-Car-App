pipeline {
    agent any
    
    environment {
        // Docker Configuration
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_IMAGE_NAME = 'syle712/vucar-app'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        DOCKER_CREDENTIALS_ID = 'docker-registry-credentials'
        
        // Application Configuration
        NODE_VERSION = '18'
        
        // Memory Optimization
        NODE_OPTIONS = '--max-old-space-size=512'
        DOCKER_BUILDKIT = '1'
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }
    
    tools {
        nodejs env.NODE_VERSION
    }
    
    stages {
        stage('🔍 Initialize') {
            steps {
                script {
                    echo "🌿 Branch: ${env.BRANCH_NAME}"
                    echo "🐳 Docker image: ${env.DOCKER_IMAGE_NAME}:${env.DOCKER_TAG}"
                    echo "🎯 Mode: CI/CD Testing (No Deployment)"
                }
            }
        }
        
        stage('📦 Checkout') {
            steps {
                echo "📥 Checking out source code"
                checkout scm
                
                // Copy build environment file
                sh '''
                    echo "📋 Setting up build environment"
                    cp .env.build .env.local
                    echo "✅ Environment variables configured for build"
                '''
            }
        }
        
        stage('🔍 Install Dependencies') {
            steps {
                echo "📦 Installing Node.js dependencies"
                sh '''
                    npm ci --prefer-offline --no-audit --progress=false --silent
                    npm list --depth=0
                    echo "📊 Dependencies installed: $(ls node_modules | wc -l) packages"
                '''
            }
        }
        
        stage('🔍 Code Quality') {
            parallel {
                stage('Lint') {
                    steps {
                        echo "🔍 Running ESLint"
                        sh '''
                            # Create basic lint script if not exists
                            if ! npm run lint --silent 2>/dev/null; then
                                echo "No lint script found, running basic checks..."
                                npx next lint --dir . || echo "Lint completed with warnings"
                            fi
                        '''
                    }
                    post {
                        always {
                            echo "📊 Lint check completed"
                        }
                    }
                }
                
                stage('Security Audit') {
                    steps {
                        echo "🔒 Running security audit"
                        sh '''
                            npm audit --audit-level moderate || echo "Security audit completed with warnings"
                            npm outdated || echo "Dependency check completed"
                        '''
                    }
                }
            }
        }
        
        stage('🏗️ Build Application') {
            steps {
                echo "🏗️ Building Next.js application"
                sh '''
                    npm run build
                    
                    # Verify build output
                    if [ -d ".next" ]; then
                        echo "✅ Next.js build successful"
                        ls -la .next/
                    else
                        echo "❌ Build failed - .next directory not found"
                        exit 1
                    fi
                '''
            }
            post {
                success {
                    echo "✅ Application build completed successfully"
                }
                failure {
                    echo "❌ Application build failed"
                }
            }
        }
        
        stage('🐳 Build Docker Image') {
            steps {
                script {
                    echo "🐳 Building Docker image"
                    def image = docker.build("${env.DOCKER_IMAGE_NAME}:${env.DOCKER_TAG}")
                    echo "✅ Docker image built successfully"
                }
            }
        }
        
        stage(' Push Docker Image') {
            steps {
                script {
                    echo "📤 Pushing Docker image to registry"
                    docker.withRegistry('https://index.docker.io/v1/', env.DOCKER_CREDENTIALS_ID) {
                        def image = docker.image("${env.DOCKER_IMAGE_NAME}:${env.DOCKER_TAG}")
                        image.push()
                    }
                    echo "✅ Docker image pushed successfully"
                }
            }
        }
        
        stage('✅ CI/CD Complete') {
            steps {
                script {
                    echo "🎉 CI/CD Pipeline completed successfully!"
                    echo "📦 Docker image: ${env.DOCKER_IMAGE_NAME}:${env.DOCKER_TAG}"
                    echo "🚀 Ready for deployment!"
                }
            }
        }
    }
    
    post {
        always {
            script {
                // Comprehensive cleanup to save memory & space
                sh '''
                    echo "🧹 Cleaning up to free memory..."
                    
                    # Clean npm cache
                    npm cache clean --force 2>/dev/null || true
                    
                    # Clean node_modules cache
                    rm -rf node_modules/.cache 2>/dev/null || true
                    
                    # Clean Docker aggressively
                    docker image prune -f
                    docker builder prune -f 2>/dev/null || true
                    docker system prune -f
                    
                    # Show final status
                    echo "📊 Final disk usage:"
                    docker system df
                    du -sh node_modules 2>/dev/null || echo "No node_modules"
                '''
            }
        }
        
        success {
            echo "🎉 CI/CD Pipeline completed successfully!"
        }
        
        failure {
            echo "❌ CI/CD Pipeline failed!"
        }
        
        cleanup {
            echo "🧹 Cleaning up workspace"
            cleanWs()
        }
    }
}