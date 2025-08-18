pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS = credentials('dockerhub-credentials')  // Jenkins credential ID
        DOCKER_IMAGE = "softconsist/crud-123"
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
                    def IMAGE_TAG = "${env.BUILD_NUMBER}"  // unique tag per Jenkins build
                    sh """
                      docker build -t $DOCKER_IMAGE:$IMAGE_TAG .
                      docker build -t $DOCKER_IMAGE:latest .
                      echo $DOCKER_HUB_CREDENTIALS_PSW | docker login -u $DOCKER_HUB_CREDENTIALS_USR --password-stdin
                      docker push $DOCKER_IMAGE:$IMAGE_TAG
                      docker push $DOCKER_IMAGE:latest
                    """

                    // Save the tag for next stage
                    env.IMAGE_TAG = IMAGE_TAG
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    sh """
                      # Update Deployment with new image (forces rolling update)
                      kubectl set image deployment/crud-app crud-app=$DOCKER_IMAGE:$IMAGE_TAG --record
                      kubectl apply -f k8s/svc.yaml
                    """
                }
            }
        }
    }
}
