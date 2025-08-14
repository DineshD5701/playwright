pipeline {
    agent any

    environment {
        NAMESPACE = "default"
        TOTAL_SHARDS = 4
        KUBECONFIG_CONTENT = credentials('KUBECONFIG_CONTENT')
        DOCKER_IMAGE = "dinesh571/playwright:latest"
        PVC_NAME = "allure-pvc"  // Your PVC name
    }

    stages {

        stage('Build & Push Docker Image') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
                        sh '''
                            echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin
                            docker build -t $DOCKER_IMAGE .
                            docker push $DOCKER_IMAGE
                        '''
                    }
                }
            }
        }

        stage('Run Playwright Jobs in K8s') {
            steps {
                script {
                    // Clean up any old jobs
                    sh '''
                        for i in $(seq 1 ${TOTAL_SHARDS}); do
                            kubectl delete job playwright-test-\$i --namespace=${NAMESPACE} --ignore-not-found
                        done
                    '''

                    // Start new jobs
                    sh '''
                        for i in $(seq 1 ${TOTAL_SHARDS}); do
                            sed "s/{{SHARD_ID}}/\$i/g; s/{{TOTAL_SHARDS}}/${TOTAL_SHARDS}/g; s|\$DOCKERHUB_USERNAME|${DOCKER_IMAGE}|g" \
                            k8s/playwright-job.yml | kubectl apply --namespace=${NAMESPACE} -f -
                        done
                    '''

                    // Wait for jobs to complete
                    sh '''
                        echo "Waiting for Playwright jobs to finish..."
                        kubectl wait --for=condition=complete job/playwright-test-1 --namespace=${NAMESPACE} --timeout=900s
                    '''
                }
            }
        }

        stage('Copy Allure Results from K8s') {
            steps {
                script {
                    sh """
                        mkdir -p allure-results
                        POD_NAME=\$(kubectl get pods --namespace=${NAMESPACE} -l job-name=playwright-test-1 -o jsonpath='{.items[0].metadata.name}')
                        kubectl cp ${NAMESPACE}/\$POD_NAME:/app/allure-results allure-results
                    """
                }
            }
        }

        stage('Generate Allure Report') {
            steps {
                sh """
                    allure generate allure-results --clean -o allure-report
                """
            }
        }

        stage('Publish Allure Report in Jenkins') {
            steps {
                allure([
                    includeProperties: false,
                    jdk: '',
                    results: [[path: 'allure-results']]
                ])
            }
        }
    }
}
