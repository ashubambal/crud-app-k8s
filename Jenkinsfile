pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "softconsist/crud-123"
        DOCKER_CREDENTIALS = credentials('dockerhub-credentials')   // 🔐 Jenkins credential ID
        SONAR_TOKEN = credentials('sonar-token')                    // 🔐 Your SonarCloud token
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('SonarCloud Analysis') {
            steps {
                withSonarQubeEnv('SonarCloud') {
                    sh """
                        sonar-scanner \
                          -Dsonar.projectKey=ashubambal \
                          -Dsonar.organization=ashubambal \
                          -Dsonar.host.url=https://sonarcloud.io \
                          -Dsonar.login=$SONAR_TOKEN
                    """
                }
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                script {
                    def IMAGE_TAG = env.BUILD_NUMBER ?: 'latest'
                    
                    sh """
                        docker build -t $DOCKER_IMAGE:$IMAGE_TAG .
                        docker tag $DOCKER_IMAGE:$IMAGE_TAG $DOCKER_IMAGE:latest

                        echo $DOCKER_CREDENTIALS_PSW | docker login -u $DOCKER_CREDENTIALS_USR --password-stdin
                        docker push $DOCKER_IMAGE:$IMAGE_TAG
                        docker push $DOCKER_IMAGE:latest
                    """

                    // Store for next stage
                    env.IMAGE_TAG = IMAGE_TAG
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    sh """
                        kubectl set image deployment/crud-app crud-app=$DOCKER_IMAGE:$IMAGE_TAG --record
                        kubectl apply -f k8s/service.yaml
                    """
                }
            }
        }
    }
}

