pipeline {
    agent any

    environment {
        NAMESPACE = "default"
        TOTAL_SHARDS = 4
        KUBECONFIG_CONTENT = credentials('KUBECONFIG_CONTENT')
        DOCKER_IMAGE = "dinesh571/playwright:latest"
        PVC_NAME = "allure-pvc"
    }

    stages {
        stage('Run Playwright Jobs in K8s') {
            steps {
                script {
                    for (int i = 1; i <= env.TOTAL_SHARDS.toInteger(); i++) {
                        sh """
                        sed "s/{{SHARD_ID}}/${i}/g; s/{{TOTAL_SHARDS}}/${TOTAL_SHARDS}/g; s|{{DOCKER_IMAGE}}|${DOCKER_IMAGE}|g; s|{{PVC_NAME}}|${PVC_NAME}|g; s|{{PVC_MOUNT_PATH}}|/app/allure-results|g" \
                        k8s/playwright-job.yml | kubectl apply --namespace=${NAMESPACE} -f -
                        """
                    }
                }
            }
        }

        stage('Wait for Jobs to Complete') {
            steps {
                sh """
                    echo "Waiting for Playwright jobs to finish..."
                    kubectl wait --for=condition=complete --timeout=900s job --all --namespace=${NAMESPACE}
                """
            }
        }

        stage('Collect Allure Results from All Shards') {
            steps {
                sh """
                    mkdir -p allure-results
                    for i in \$(seq 1 ${TOTAL_SHARDS}); do
                        POD_NAME=\$(kubectl get pods --namespace=${NAMESPACE} -l job-name=playwright-test-\$i -o jsonpath='{.items[0].metadata.name}')
                        kubectl cp ${NAMESPACE}/\$POD_NAME:/app/allure-results ./allure-results/shard-\$i
                    done
                """
            }
        }

        stage('Merge Allure Results') {
            steps {
                sh """
                    mkdir -p allure-merged
                    find allure-results -type d -name '*' -exec cp -r {}/* allure-merged/ \\;
                """
            }
        }

        stage('Generate Allure Report') {
            steps {
                sh """
                    allure generate allure-merged --clean -o allure-report
                """
            }
        }

        stage('Publish Allure Report in Jenkins') {
            steps {
                allure([
                    includeProperties: false,
                    jdk: '',
                    results: [[path: 'allure-merged']]
                ])
            }
        }
    }
}
