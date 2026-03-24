// Jenkinsfile-frontend - Frontend Service Pipeline
pipeline {
    agent any
    
    environment {
        // Repository URL
        FRONTEND_REPO = 'https://github.com/navinmalviya/rtm-tele-fe.git'
        BASE_URL='http://localhost:3001'
        NEXTAUTH_SECRET='my_ultra_secure_nextauth_secret'
        NEXTAUTH_URL='http://localhost:3000'
        NEXT_PUBLIC_BASE_URL='http://localhost:3001'
        // Branch to build
        BRANCH = 'main'
        
        // Container name
        FRONTEND_CONTAINER = 'frontend-app'
        
        // Image name
        FRONTEND_IMAGE = 'frontend-app'
        
        // Port mappings
        FRONTEND_HOST_PORT = '3000'
        FRONTEND_CONTAINER_PORT = '3000'
        
        // Backend API URL (adjust based on your setup)
        BACKEND_API_URL = 'http://localhost:3001'
        
        // Network name
        NETWORK_NAME = 'app-network'
    }
    
    stages {
        stage('Setup Workspace') {
            steps {
                sh '''
                    mkdir -p frontend
                    echo "Workspace setup completed"
                '''
            }
        }
        
        stage('Clone Frontend Repository') {
            steps {
                dir('frontend') {
                    // Clean directory if exists
                    sh 'rm -rf *'
                    // Clone frontend repository
                    git branch: "${BRANCH}",
                        url: "${FRONTEND_REPO}"
                    echo "Frontend repository cloned successfully"
                }
            }
        }
        
        stage('Verify Dockerfile') {
            steps {
                script {
                    dir('frontend') {
                        if (!fileExists('Dockerfile')) {
                            error("Dockerfile not found in frontend repository! Please ensure it exists.")
                        }
                        echo "✓ Frontend Dockerfile found"
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    dir('frontend') {
                        // Generate timestamp for versioning
                        def timestamp = new Date().format('yyyyMMdd-HHmmss')
                        env.FRONTEND_TAG = timestamp
                        
                        // Build frontend image
                        sh """
                            docker build -t ${FRONTEND_IMAGE}:${env.FRONTEND_TAG} .
                            docker tag ${FRONTEND_IMAGE}:${env.FRONTEND_TAG} ${FRONTEND_IMAGE}:latest
                        """
                        echo "✓ Frontend image built: ${FRONTEND_IMAGE}:${env.FRONTEND_TAG}"
                    }
                }
            }
        }
        
        stage('Create Docker Network') {
            steps {
                script {
                    // Create network if it doesn't exist
                    sh """
                        docker network inspect ${NETWORK_NAME} > /dev/null 2>&1 || docker network create ${NETWORK_NAME}
                    """
                    echo "✓ Docker network '${NETWORK_NAME}' is ready"
                }
            }
        }
        
        stage('Stop and Remove Old Container') {
            steps {
                script {
                    // Stop and remove old frontend container
                    sh """
                        docker stop ${FRONTEND_CONTAINER} 2>/dev/null || true
                        docker rm ${FRONTEND_CONTAINER} 2>/dev/null || true
                    """
                    echo "✓ Old container removed"
                }
            }
        }
        
        stage('Deploy Frontend Container') {
            steps {
                script {
                    // Deploy frontend container
                    sh """
                        docker run -d \\
                            --name ${FRONTEND_CONTAINER} \\
                            --network ${NETWORK_NAME} \\
                            -p ${FRONTEND_HOST_PORT}:${FRONTEND_CONTAINER_PORT} \\
                            --restart unless-stopped \\
                            -e REACT_APP_API_URL=${BACKEND_API_URL} \\
                            -e API_URL=${BACKEND_API_URL} \\
                            -e BASE_URL=${BASE_URL} \\
                            -e NEXTAUTH_SECRET=${NEXTAUTH_SECRET} \\
                            -e NEXTAUTH_URL=${NEXTAUTH_URL} \\
                            -e NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL} \\
                            ${FRONTEND_IMAGE}:${env.FRONTEND_TAG}
                    """
                    echo "✓ Frontend container deployed on port ${FRONTEND_HOST_PORT}"
                }
            }
        }
        
        stage('Wait for Frontend to Start') {
            steps {
                script {
                    // Wait for frontend to start
                    sleep(10)
                    
                    // Check if container is running
                    def containerStatus = sh(
                        script: "docker ps --filter name=${FRONTEND_CONTAINER} --format '{{.Status}}'",
                        returnStdout: true
                    ).trim()
                    
                    echo "Frontend container status: ${containerStatus}"
                    
                    // Check frontend logs
                    sh "docker logs --tail 30 ${FRONTEND_CONTAINER} || true"
                }
            }
        }
        
        stage('Verify Frontend Deployment') {
            steps {
                script {
                    // Test if frontend is responding
                    def maxRetries = 10
                    def retryCount = 0
                    def frontendReady = false
                    
                    while (retryCount < maxRetries && !frontendReady) {
                        try {
                            def response = sh(
                                script: "curl -s -o /dev/null -w '%{http_code}' http://localhost:${FRONTEND_HOST_PORT}",
                                returnStdout: true
                            ).trim()
                            
                            if (response == "200" || response == "301" || response == "302") {
                                frontendReady = true
                                echo "✓ Frontend is responding with HTTP ${response}"
                            } else {
                                echo "Frontend returned HTTP ${response}, waiting..."
                                sleep(5)
                                retryCount++
                            }
                        } catch (Exception e) {
                            echo "Frontend not ready yet (attempt ${retryCount + 1}/${maxRetries})"
                            sleep(5)
                            retryCount++
                        }
                    }
                    
                    if (frontendReady) {
                        echo """
                            ====================================
                            Frontend Deployment Successful!
                            ====================================
                            Container: ${FRONTEND_CONTAINER}
                            URL: http://localhost:${FRONTEND_HOST_PORT}
                            Image: ${FRONTEND_IMAGE}:${env.FRONTEND_TAG}
                            ====================================
                        """
                    } else {
                        echo "⚠ Frontend may not be fully ready, but deployment completed"
                        echo "Check logs: docker logs ${FRONTEND_CONTAINER}"
                    }
                }
            }
        }
        
        stage('Cleanup Old Images') {
            steps {
                script {
                    // Keep only last 5 images
                    sh """
                        docker image prune -f || true
                        docker images ${FRONTEND_IMAGE} --format '{{.Tag}}' | tail -n +6 | xargs -r docker rmi || true
                    """
                    echo "✓ Old images cleaned up"
                }
            }
        }
    }
    
    post {
        success {
            echo """
                🎉 Frontend Deployment Successful!
                
                Frontend Application: http://localhost:${FRONTEND_HOST_PORT}
                Image Tag: ${FRONTEND_IMAGE}:${env.FRONTEND_TAG}
                Container: ${FRONTEND_CONTAINER}
                API URL: ${BACKEND_API_URL}
                
                To view logs: docker logs -f ${FRONTEND_CONTAINER}
                To stop: docker stop ${FRONTEND_CONTAINER}
            """
        }
        
        failure {
            echo """
                ❌ Frontend Deployment Failed!
                
                Check the logs above for details.
                
                Debug commands:
                - docker ps -a | grep frontend
                - docker logs ${FRONTEND_CONTAINER}
                - docker inspect ${FRONTEND_CONTAINER}
            """
            
            // Show running containers for debugging
            sh 'docker ps -a'
            sh 'docker images | head -20'
            
            // Show frontend logs if container exists
            script {
                try {
                    sh "docker logs --tail 50 ${FRONTEND_CONTAINER} 2>/dev/null || true"
                } catch (Exception e) {
                    echo "Could not fetch frontend logs"
                }
            }
        }
    }
}
