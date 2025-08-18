pipeline {
    agent any

    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        SONAR_TOKEN = credentials('sonar-token')
        SONAR_ORGANIZATION = 'ashubambal'
        SONAR_PROJECT_KEY = 'ashubambal'
        DOCKER_IMAGE = 'softconsist/crud-123'
    }

    stages {
        stage('Code-Analysis') {
            steps {
                withSonarQubeEnv('SonarCloud') {
                    sh '''$SCANNER_HOME/bin/sonar-scanner -X \
                        -Dsonar.organization=${SONAR_ORGANIZATION} \
                        -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=https://sonarcloud.io \
                        -Dsonar.login=$SONAR_TOKEN'''
                }
            }
        }

        stage('Docker Build and Push') {
            steps {
                script {
                    def version = "v${env.BUILD_NUMBER ?: '1'}"
                    env.IMAGE_TAG = "${DOCKER_IMAGE}:${version}"

                    docker.withRegistry('', 'docker-cred') {
                        def image = docker.build(env.IMAGE_TAG)
                        image.push()
                        image.push("latest") // Optional
                    }
                }
            }
        }

        stage('Update and Rollout Deployment') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    script {
                        try {
                            // Replace image version in the YAML file
                            sh """
                                sed -i 's|image: ${DOCKER_IMAGE}:.*|image: ${IMAGE_TAG}|' k8s/application.yaml
                                echo "✅ Updated image in k8s/application.yaml to ${IMAGE_TAG}"

                                # Apply the updated deployment
                                kubectl apply -f k8s/application.yaml
                                echo "🚀 Applied updated Kubernetes deployment"

                                # Wait for rollout to complete
                                kubectl rollout status deployment crud-app --timeout=60s
                                echo "✅ Rollout completed successfully"

                            """
                        } catch (Exception err) {
                            echo "❌ Deployment rollout failed: ${err.getMessage()}"

                            // Rollback the deployment
                            sh """
                                echo "🔙 Attempting rollback..."
                                kubectl rollout undo deployment crud-app
                            """

                            // Mark build as failed
                            error("Deployment failed and was rolled back.")
                        }
                    }
                }
            }
        }
    }
}

