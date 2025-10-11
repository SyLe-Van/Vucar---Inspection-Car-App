pipeline {
    agent any
    
    environment {
        // 🐳 DOCKER CONFIGURATION - CẬP NHẬT THÔNG TIN CỦA BẠN
        DOCKER_REGISTRY = 'docker.io'  // hoặc 'your-registry.com'
        DOCKER_IMAGE_NAME = 'your-dockerhub-username/vucar-app'  // ⚠️ THAY ĐỔI USERNAME
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        DOCKER_CREDENTIALS_ID = 'docker-registry-credentials'
        
        // 📱 APPLICATION CONFIGURATION
        NODE_VERSION = '18'
        APP_NAME = 'vucar-app'
        PORT = '3000'
        
        // 🚀 DEPLOYMENT CONFIGURATION - CẬP NHẬT SERVER CỦA BẠN
        PRODUCTION_SERVER = 'your-production-server.com'  // ⚠️ THAY ĐỔI IP/DOMAIN
        STAGING_SERVER = 'your-staging-server.com'        // ⚠️ THAY ĐỔI IP/DOMAIN
        SSH_CREDENTIALS_ID = 'ssh-deployment-key'
        
        // 🌿 BRANCH STRATEGY
        STAGING_BRANCH = 'develop'
        PRODUCTION_BRANCH = 'main'
        
        // 📢 NOTIFICATION (TÙY CHỌN)
        SLACK_CHANNEL = '#deployments'
        SLACK_CREDENTIALS_ID = 'slack-webhook'
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
        skipDefaultCheckout()
    }
    
    triggers {
        // Poll SCM every 5 minutes for changes
        pollSCM('H/5 * * * *')
        
        // Trigger builds on webhook (configure in GitHub/GitLab)
        githubPush()
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "🔄 Checking out code from ${env.BRANCH_NAME} branch"
                }
                checkout scm
                
                script {
                    // Set dynamic variables based on branch
                    env.IS_PRODUCTION = env.BRANCH_NAME == env.PRODUCTION_BRANCH ? 'true' : 'false'
                    env.IS_STAGING = env.BRANCH_NAME == env.STAGING_BRANCH ? 'true' : 'false'
                    env.DEPLOY_TARGET = env.IS_PRODUCTION == 'true' ? 'production' : 
                                       env.IS_STAGING == 'true' ? 'staging' : 'none'
                    
                    echo "Deploy target: ${env.DEPLOY_TARGET}"
                }
            }
        }
        
        stage('Environment Setup') {
            steps {
                script {
                    echo "🔧 Setting up build environment"
                    
                    // Install Node.js using NodeJS plugin
                    nodejs(nodeJSInstallationName: "Node-${NODE_VERSION}") {
                        sh 'node --version'
                        sh 'npm --version'
                    }
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    echo "📦 Installing dependencies"
                }
                nodejs(nodeJSInstallationName: "Node-${NODE_VERSION}") {
                    sh '''
                        # Clean install for reproducible builds
                        if [ -f package-lock.json ]; then
                            npm ci --cache .npm --prefer-offline
                        else
                            npm install --cache .npm --prefer-offline
                        fi
                    '''
                }
            }
        }
        
        stage('Code Quality & Security') {
            parallel {
                stage('Lint') {
                    steps {
                        script {
                            echo "🔍 Running ESLint"
                        }
                        nodejs(nodeJSInstallationName: "Node-${NODE_VERSION}") {
                            sh 'npm run lint'
                        }
                    }
                }
                
                stage('Security Audit') {
                    steps {
                        script {
                            echo "🔒 Running security audit"
                        }
                        nodejs(nodeJSInstallationName: "Node-${NODE_VERSION}") {
                            sh '''
                                # Check for security vulnerabilities
                                npm audit --audit-level=moderate
                                
                                # Optional: Use npm-audit-ci for stricter checking
                                # npx audit-ci --moderate
                            '''
                        }
                    }
                }
                
                stage('Dependency Check') {
                    steps {
                        script {
                            echo "📋 Checking for outdated dependencies"
                        }
                        nodejs(nodeJSInstallationName: "Node-${NODE_VERSION}") {
                            sh 'npm outdated || true'
                        }
                    }
                }
            }
        }
        
        stage('Test') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    changeRequest()
                }
            }
            steps {
                script {
                    echo "🧪 Running tests"
                }
                nodejs(nodeJSInstallationName: "Node-${NODE_VERSION}") {
                    sh '''
                        # Add test commands here when you have tests
                        # npm run test
                        # npm run test:coverage
                        
                        echo "⚠️  No tests configured yet"
                    '''
                }
            }
        }
        
        stage('Build Application') {
            steps {
                script {
                    echo "🏗️  Building Next.js application"
                }
                nodejs(nodeJSInstallationName: "Node-${NODE_VERSION}") {
                    sh '''
                        # Build the Next.js application
                        npm run build
                        
                        # Verify standalone output was created
                        if [ ! -f .next/standalone/server.js ]; then
                            echo "❌ Standalone build failed - server.js not found"
                            exit 1
                        fi
                        
                        echo "✅ Build completed successfully"
                    '''
                }
            }
        }
        
        stage('Build Docker Image') {
            when {
                anyOf {
                    environment name: 'DEPLOY_TARGET', value: 'production'
                    environment name: 'DEPLOY_TARGET', value: 'staging'
                }
            }
            steps {
                script {
                    echo "🐳 Building Docker image"
                    
                    def imageTag = env.DEPLOY_TARGET == 'production' ? 
                        "${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${DOCKER_TAG}" :
                        "${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${DOCKER_TAG}-staging"
                    
                    env.DOCKER_IMAGE_TAG = imageTag
                    
                    sh """
                        # Build Docker image
                        docker build -t ${imageTag} .
                        
                        # Tag as latest for the environment
                        docker tag ${imageTag} ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${env.DEPLOY_TARGET}-latest
                        
                        # Show image info
                        docker images | grep ${DOCKER_IMAGE_NAME}
                    """
                }
            }
        }
        
        stage('Security Scan') {
            when {
                anyOf {
                    environment name: 'DEPLOY_TARGET', value: 'production'
                    environment name: 'DEPLOY_TARGET', value: 'staging'
                }
            }
            steps {
                script {
                    echo "🔍 Scanning Docker image for vulnerabilities"
                    sh """
                        # Install and run Trivy for container scanning
                        if ! command -v trivy &> /dev/null; then
                            echo "Installing Trivy..."
                            wget -qO- https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /tmp/trivy
                            export PATH=\$PATH:/tmp/trivy
                        fi
                        
                        # Scan the image
                        trivy image --exit-code 0 --severity HIGH,CRITICAL ${env.DOCKER_IMAGE_TAG} || true
                    """
                }
            }
        }
        
        stage('Push Docker Image') {
            when {
                anyOf {
                    environment name: 'DEPLOY_TARGET', value: 'production'
                    environment name: 'DEPLOY_TARGET', value: 'staging'
                }
            }
            steps {
                script {
                    echo "📤 Pushing Docker image to registry"
                    withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, 
                                                    usernameVariable: 'DOCKER_USERNAME', 
                                                    passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh """
                            # Login to Docker registry
                            echo \$DOCKER_PASSWORD | docker login ${DOCKER_REGISTRY} -u \$DOCKER_USERNAME --password-stdin
                            
                            # Push the tagged image
                            docker push ${env.DOCKER_IMAGE_TAG}
                            docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${env.DEPLOY_TARGET}-latest
                            
                            echo "✅ Image pushed successfully"
                        """
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                environment name: 'DEPLOY_TARGET', value: 'staging'
            }
            steps {
                script {
                    echo "🚀 Deploying to staging environment"
                    deployToEnvironment('staging', env.STAGING_SERVER)
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                environment name: 'DEPLOY_TARGET', value: 'production'
            }
            steps {
                script {
                    echo "🚀 Deploying to production environment"
                    
                    // Add manual approval for production deployments
                    timeout(time: 5, unit: 'MINUTES') {
                        input message: 'Deploy to production?', 
                              ok: 'Deploy',
                              submitterParameter: 'APPROVER'
                    }
                    
                    deployToEnvironment('production', env.PRODUCTION_SERVER)
                }
            }
        }
        
        stage('Health Check') {
            when {
                anyOf {
                    environment name: 'DEPLOY_TARGET', value: 'production'
                    environment name: 'DEPLOY_TARGET', value: 'staging'
                }
            }
            steps {
                script {
                    echo "🏥 Running health checks"
                    def serverUrl = env.DEPLOY_TARGET == 'production' ? 
                        "https://${env.PRODUCTION_SERVER}" : 
                        "https://${env.STAGING_SERVER}"
                    
                    sh """
                        # Wait for application to start
                        sleep 30
                        
                        # Health check
                        for i in {1..10}; do
                            if curl -f ${serverUrl}/api/health; then
                                echo "✅ Health check passed"
                                break
                            else
                                echo "⏳ Waiting for application to be ready... (\$i/10)"
                                sleep 15
                            fi
                            
                            if [ \$i -eq 10 ]; then
                                echo "❌ Health check failed after 10 attempts"
                                exit 1
                            fi
                        done
                    """
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo "🧹 Cleaning up workspace"
                
                // Clean up Docker images to save space
                sh '''
                    # Remove dangling images
                    docker image prune -f
                    
                    # Remove old images of this app (keep last 3)
                    docker images ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME} --format "table {{.Tag}}" | tail -n +2 | head -n -3 | xargs -r docker rmi ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}: || true
                '''
            }
        }
        
        success {
            script {
                def message = """
                ✅ *Deployment Successful* 
                
                *Project:* ${env.APP_NAME}
                *Branch:* ${env.BRANCH_NAME}
                *Environment:* ${env.DEPLOY_TARGET}
                *Build:* #${env.BUILD_NUMBER}
                *Duration:* ${currentBuild.durationString}
                
                ${env.DEPLOY_TARGET != 'none' ? "*URL:* https://" + (env.DEPLOY_TARGET == 'production' ? env.PRODUCTION_SERVER : env.STAGING_SERVER) : ''}
                """
                
                sendSlackNotification(message, 'good')
            }
        }
        
        failure {
            script {
                def message = """
                ❌ *Deployment Failed*
                
                *Project:* ${env.APP_NAME}
                *Branch:* ${env.BRANCH_NAME}
                *Build:* #${env.BUILD_NUMBER}
                *Stage:* ${env.STAGE_NAME}
                *Duration:* ${currentBuild.durationString}
                
                *Console:* ${env.BUILD_URL}console
                """
                
                sendSlackNotification(message, 'danger')
            }
        }
        
        unstable {
            script {
                def message = """
                ⚠️ *Build Unstable*
                
                *Project:* ${env.APP_NAME}
                *Branch:* ${env.BRANCH_NAME}
                *Build:* #${env.BUILD_NUMBER}
                *Duration:* ${currentBuild.durationString}
                """
                
                sendSlackNotification(message, 'warning')
            }
        }
    }
}

// Helper function for deployment
def deployToEnvironment(environment, server) {
    withCredentials([sshUserPrivateKey(credentialsId: env.SSH_CREDENTIALS_ID, 
                                      keyFileVariable: 'SSH_KEY', 
                                      usernameVariable: 'SSH_USER')]) {
        sh """
            # Deploy using Docker Compose or Kubernetes
            ssh -i \$SSH_KEY -o StrictHostKeyChecking=no \$SSH_USER@${server} '
                # Pull the latest image
                docker pull ${env.DOCKER_IMAGE_TAG}
                
                # Stop existing container
                docker stop ${env.APP_NAME}-${environment} || true
                docker rm ${env.APP_NAME}-${environment} || true
                
                # Start new container
                docker run -d \\
                    --name ${env.APP_NAME}-${environment} \\
                    --restart unless-stopped \\
                    -p ${environment == 'production' ? '80:3000' : '8080:3000'} \\
                    -e NODE_ENV=${environment} \\
                    ${env.DOCKER_IMAGE_TAG}
                
                echo "✅ Deployed successfully to ${environment}"
            '
        """
    }
}

// Helper function for Slack notifications
def sendSlackNotification(message, color) {
    try {
        withCredentials([string(credentialsId: env.SLACK_CREDENTIALS_ID, variable: 'SLACK_WEBHOOK')]) {
            sh """
                curl -X POST -H 'Content-type: application/json' \\
                    --data '{"channel":"${env.SLACK_CHANNEL}","attachments":[{"color":"${color}","text":"${message}"}]}' \\
                    \$SLACK_WEBHOOK
            """
        }
    } catch (Exception e) {
        echo "Failed to send Slack notification: ${e.getMessage()}"
    }
}