pipeline {
    agent any

    environment {
        // This secret should be stored in Jenkins as a "Secret Text" or "Secret File"
        KUBECONFIG_CONTENT = credentials('KUBECONFIG_CONTENT')
        DOCKER_IMAGE = "dinesh571/playwright:latest"
    }

    stages {
        stage('Setup Kubeconfig') {
            steps {
                script {
                    sh '''
                        echo "$KUBECONFIG_CONTENT" | base64 -d > kubeconfig
                        export KUBECONFIG=$(pwd)/kubeconfig
                        kubectl config get-contexts
                        kubectl cluster-info
                    '''
                }
            }
        }

        stage('Deploy Allure PVC') {
            steps {
                script {
                    sh '''
                        export KUBECONFIG=$(pwd)/kubeconfig
                        kubectl apply -f k8s/allure-pvc.yml
                    '''
                }
            }
        }

        stage('Deploy Playwright Grid') {
            steps {
                script {
                    sh '''
                        export KUBECONFIG=$(pwd)/kubeconfig
                        # Replace with your actual job/deployment manifests
                        for i in 1 2 3 4; do
                            kubectl delete job playwright-test-$i --ignore-not-found
                            sed "s/{{SHARD_ID}}/$i/g; \
                            s/{{TOTAL_SHARDS}}/4/g; \
                            s|\${DOCKER_IMAGE}|$DOCKER_IMAGE|g" k8s/playwright-job.yml | \
                        kubectl apply -f -

                        done

                    '''
                }
            }
        }

        stage('Wait & Fetch Allure Results') {
            steps {
                script {
                    sh '''
                        export KUBECONFIG=$(pwd)/kubeconfig
                        echo "Waiting for tests to complete..."
                        kubectl wait --for=condition=complete job --all --timeout=600s || true

                        mkdir -p allure-results
                        kubectl cp $(kubectl get pods --selector=job-name=playwright-test-1 -o jsonpath='{.items[0].metadata.name}'):/app/allure-results ./allure-results
                    '''
                }
            }
        }

        stage('Generate Allure Report') {
            steps {
                script {
                    sh '''
                        npx allure generate allure-results --clean -o allure-report
                        npx allure open allure-report
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'rm -f kubeconfig'
        }
    }
}
