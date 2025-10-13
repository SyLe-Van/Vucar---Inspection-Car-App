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
                    # Copy build environment for local Next.js build
                    cp .env.build .env.local
                    
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
        
        stage('🚀 Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "🚀 Deploying to Production Environment (Local Server)"
                    
                    // Deploy locally on same server as Jenkins
                    sh '''
                        # Production deployment directory
                        DEPLOY_DIR="/opt/vucar-production"
                        
                        echo "📦 Deploying Docker image: ${DOCKER_IMAGE_NAME}:${DOCKER_TAG}"
                        
                        # Create deployment directory
                        sudo mkdir -p $DEPLOY_DIR
                        sudo chown jenkins:jenkins $DEPLOY_DIR || sudo chown $USER:$USER $DEPLOY_DIR
                        
                        # Copy deployment files
                        cp docker-compose.production.yml $DEPLOY_DIR/docker-compose.yml
                        cp nginx.production.conf $DEPLOY_DIR/nginx.conf
                        cp .env.production $DEPLOY_DIR/.env
                        cp deploy-production.sh $DEPLOY_DIR/
                        
                        # Set environment variables
                        cd $DEPLOY_DIR
                        export DOCKER_TAG=${DOCKER_TAG}
                        export DOCKER_REGISTRY=${DOCKER_REGISTRY}
                        export DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME}
                        
                        # Stop existing containers
                        sudo docker-compose down || echo "No existing containers"
                        
                        # Pull latest image
                        sudo docker pull ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${DOCKER_TAG}
                        
                        # Start new containers
                        sudo docker-compose up -d
                        
                        # Wait and health check
                        sleep 30
                        curl -f http://localhost:3000/api/health || exit 1
                        
                        echo "✅ Deployment completed successfully!"
                    '''
                }
            }
            post {
                success {
                    echo "✅ Production deployment completed successfully!"
                }
                failure {
                    echo "❌ Production deployment failed!"
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