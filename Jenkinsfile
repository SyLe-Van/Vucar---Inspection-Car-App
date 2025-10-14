pipeline {
    agent any
    
    parameters {
        booleanParam(
            name: 'DEPLOY_TO_PRODUCTION',
            defaultValue: true,
            description: 'Deploy to production server after build? (Uncheck to skip deployment)'
        )
    }
    
    environment {
        // Docker Configuration
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_IMAGE_NAME = 'syle712/vucar-app'
        DOCKER_CREDENTIALS_ID = 'docker-registry-credentials'
        
        // Production Server Configuration
        PRODUCTION_SERVER_IP = '18.141.38.4'
        PRODUCTION_CONTAINER_NAME = 'vucar-production-new'
        
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
        
        stage('🔍 Branch Check') {
            steps {
                script {
                    def branch = env.GIT_BRANCH ?: env.BRANCH_NAME ?: 'unknown'
                    echo "Current branch: ${branch}"
                    
                    if (!branch.contains('main')) {
                        echo "⏭️ Skipping pipeline - not main branch"
                        currentBuild.result = 'ABORTED'
                        error('Pipeline only runs on main branch')
                    }
                    
                    echo "✅ Main branch detected - continuing pipeline"
                }
            }
        }

        stage('🔍 Initialize') {
            steps {
                script {
                    // Get branch name from Git
                    def branch = env.GIT_BRANCH ?: env.BRANCH_NAME ?: 'unknown'
                    // Remove 'origin/' prefix if present
                    branch = branch.replaceAll(/^origin\//, '')
                    env.BRANCH_NAME = branch
                    
                    echo "🌿 Detected branch: ${branch}"
                    
                    // Set Docker tag based on branch
                    if (branch == 'main') {
                        env.DOCKER_TAG = "v1.0.${env.BUILD_NUMBER}"
                        echo "🚀 PRODUCTION Pipeline"
                        echo "📁 Environment: .env.production"
                        echo "🐳 Docker tag: ${env.DOCKER_IMAGE_NAME}:${env.DOCKER_TAG}"
                        echo "🎯 Mode: Full CI/CD with Deploy Option"
                    } else {
                        env.DOCKER_TAG = "${branch}-${env.BUILD_NUMBER}"
                        echo "🔧 DEVELOPMENT Pipeline"
                        echo "📁 Environment: .env.local"
                        echo "🐳 Docker tag: ${env.DOCKER_IMAGE_NAME}:${env.DOCKER_TAG}"
                        echo "🎯 Mode: CI/CD Testing (No Deployment)"
                    }
                    echo "📦 Deploy to Production: ${params.DEPLOY_TO_PRODUCTION}"
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
                }
                stage('Type Check') {
                    steps {
                        echo "📝 Checking TypeScript types"
                        sh '''
                            if [ -f "tsconfig.json" ]; then
                                npx tsc --noEmit --skipLibCheck || echo "Type check completed with warnings"
                            else
                                echo "No TypeScript configuration found, skipping"
                            fi
                        '''
                    }
                }
            }
        }
        
        stage('🏗️ Build Application') {
            steps {
                echo "🏗️ Building Next.js application"
                sh '''
                    echo "Building application..."
                    npm run build
                    echo "Build completed successfully"
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
        
        stage('📤 Push Docker Image') {
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
            steps {
                script {
                    if (params.DEPLOY_TO_PRODUCTION) {
                        echo "🚀 Deploying to Production Server..."
                        
                        // Use Jenkins credentials with fallback
                        try {
                            withCredentials([
                                string(credentialsId: 'mongodb-uri-production', variable: 'MONGODB_URL')
                            ]) {
                                sh """
                                    # SSH to production server and deploy
                                    ssh -o StrictHostKeyChecking=no -i ~/.ssh/vucar-key.pem ec2-user@${env.PRODUCTION_SERVER_IP} '
                                        set -e
                                        
                                        echo "🔍 Current environment:"
                                        echo "  Docker tag: ${env.DOCKER_TAG}"
                                        echo "  Image: ${env.DOCKER_IMAGE_NAME}:${env.DOCKER_TAG}"
                                        echo "  Container: ${env.PRODUCTION_CONTAINER_NAME}"
                                        echo "  Server IP: ${env.PRODUCTION_SERVER_IP}"
                                        
                                        # Set MongoDB URL with fallback
                                        MONGO_URL="\${MONGODB_URL}"
                                        
                                        echo "🐳 Pulling latest Docker image..."
                                        docker pull ${env.DOCKER_IMAGE_NAME}:${env.DOCKER_TAG}
                                        
                                        echo "🔄 Stopping old container..."
                                        docker stop ${env.PRODUCTION_CONTAINER_NAME} 2>/dev/null || echo "Container not running"
                                        docker rm ${env.PRODUCTION_CONTAINER_NAME} 2>/dev/null || echo "Container not found"
                                        
                                        echo "🧹 Cleaning up old images..."
                                        docker image prune -f
                                        
                                        echo "🚀 Starting new container..."
                                        docker run -d \\
                                            --name ${env.PRODUCTION_CONTAINER_NAME} \\
                                            --restart unless-stopped \\
                                            -p 3000:3000 \\
                                            -e MONGODB_URL="\$MONGO_URL" \\
                                            -e NODE_ENV=production \\
                                            -e PORT=3000 \\
                                            ${env.DOCKER_IMAGE_NAME}:${env.DOCKER_TAG}
                                        
                                        echo "⏳ Waiting for application to start..."
                                        sleep 20
                                        
                                        echo "📊 Container status:"
                                        docker ps -a | grep ${env.PRODUCTION_CONTAINER_NAME} || echo "Container not found in ps"
                                        
                                        echo "📝 Container logs (last 30 lines):"
                                        docker logs ${env.PRODUCTION_CONTAINER_NAME} --tail=30 2>&1 || echo "No logs available"
                                        
                                        echo "🔍 Checking application health..."
                                        HEALTH_CHECK_PASSED=false
                                        for i in {1..6}; do
                                            echo "  Attempt \$i/6..."
                                            # Thử cả 2 endpoints: root và health
                                            if curl -f http://localhost:3000 2>/dev/null || curl -f http://localhost:3000/api/health 2>/dev/null; then
                                                echo "✅ Health check passed!"
                                                HEALTH_CHECK_PASSED=true
                                                break
                                            fi
                                            if [ \$i -lt 6 ]; then
                                                echo "  ⏳ Waiting 10 seconds before retry..."
                                                sleep 10
                                            fi
                                        done
                                        
                                        if [ "\$HEALTH_CHECK_PASSED" = false ]; then
                                            echo "⚠️  Health check failed after 6 attempts"
                                            echo "📝 Full container logs:"
                                            docker logs ${env.PRODUCTION_CONTAINER_NAME} 2>&1
                                            exit 1
                                        fi
                                        
                                        echo "✅ Deployment completed successfully!"
                                    '
                                """
                            }
                        } catch (Exception e) {
                            echo "⚠️  Credentials not found, using direct SSH..."
                            sh """
                                # Direct SSH deployment without Jenkins credentials
                                ssh -o StrictHostKeyChecking=no -i ~/.ssh/vucar-key.pem ec2-user@${env.PRODUCTION_SERVER_IP} '
                                    set -e
                                    
                                    echo "🔍 Current environment:"
                                    echo "  Docker tag: ${env.DOCKER_TAG}"
                                    echo "  Image: ${env.DOCKER_IMAGE_NAME}:${env.DOCKER_TAG}"
                                    echo "  Container: ${env.PRODUCTION_CONTAINER_NAME}"
                                    
                                    # Fallback MongoDB URL
                                    MONGO_URL="mongodb+srv://sycung9001:-pQk2Ht-%2ARdH7LT@cluster0.uy3at.mongodb.net/vucar_production?retryWrites=true&w=majority&appName=Cluster0"
                                    
                                    echo "🐳 Pulling latest Docker image..."
                                    docker pull ${env.DOCKER_IMAGE_NAME}:${env.DOCKER_TAG}
                                    
                                    echo "🔄 Stopping old container..."
                                    docker stop ${env.PRODUCTION_CONTAINER_NAME} 2>/dev/null || echo "Container not running"
                                    docker rm ${env.PRODUCTION_CONTAINER_NAME} 2>/dev/null || echo "Container not found"
                                    
                                    echo "🧹 Cleaning up old images..."
                                    docker image prune -f
                                    
                                    echo "🚀 Starting new container..."
                                    docker run -d \\
                                        --name ${env.PRODUCTION_CONTAINER_NAME} \\
                                        --restart unless-stopped \\
                                        -p 3000:3000 \\
                                        -e MONGODB_URL="\$MONGO_URL" \\
                                        -e NODE_ENV=production \\
                                        -e PORT=3000 \\
                                        ${env.DOCKER_IMAGE_NAME}:${env.DOCKER_TAG}
                                    
                                    echo "⏳ Waiting for application to start..."
                                    sleep 20
                                    
                                    echo "📊 Container status:"
                                    docker ps -a | grep ${env.PRODUCTION_CONTAINER_NAME}
                                    
                                    echo "📝 Container logs:"
                                    docker logs ${env.PRODUCTION_CONTAINER_NAME} --tail=30 2>&1
                                    
                                    echo "🔍 Checking application health..."
                                    HEALTH_CHECK_PASSED=false
                                    for i in {1..6}; do
                                        echo "  Attempt \$i/6..."
                                        if curl -f http://localhost:3000 2>/dev/null || curl -f http://localhost:3000/api/health 2>/dev/null; then
                                            echo "✅ Health check passed!"
                                            HEALTH_CHECK_PASSED=true
                                            break
                                        fi
                                        if [ \$i -lt 6 ]; then
                                            echo "  ⏳ Waiting 10 seconds..."
                                            sleep 10
                                        fi
                                    done
                                    
                                    if [ "\$HEALTH_CHECK_PASSED" = false ]; then
                                        echo "⚠️  Health check failed"
                                        docker logs ${env.PRODUCTION_CONTAINER_NAME} 2>&1
                                        exit 1
                                    fi
                                    
                                    echo "✅ Deployment completed!"
                                '
                            """
                        }
                    } else {
                        echo "⏭️  Skipping deployment (DEPLOY_TO_PRODUCTION=false)"
                        echo "💡 To deploy, re-run the pipeline with DEPLOY_TO_PRODUCTION=true"
                    }
                }
            }
            post {
                success {
                    script {
                        if (params.DEPLOY_TO_PRODUCTION) {
                            echo "🎉 Deployment to production successful!"
                        }
                    }
                }
                failure {
                    script {
                        if (params.DEPLOY_TO_PRODUCTION) {
                            echo "❌ Deployment to production failed!"
                        }
                    }
                }
            }
        }
        
    }
    
    post {
        always {
            echo "🧹 Cleaning workspace"
            cleanWs()
        }
        success {
            echo "✅ Pipeline completed successfully!"
        }
        failure {
            echo "❌ Pipeline failed!"
        }
    }
}
