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

        stage('Set Kubeconfig') {
            steps {
                sh '''
                    echo "$KUBECONFIG_CONTENT" | base64 -d > kubeconfig
                '''
                script {
                    env.KUBECONFIG = "${pwd()}/kubeconfig"
                }
                sh 'kubectl get nodes'
            }
        }

        stage('Run Playwright Jobs in K8s') {
            steps {
                script {
                    for (int i = 1; i <= env.TOTAL_SHARDS.toInteger(); i++) {
                        sh '''
                        for i in $(seq 1 ${TOTAL_SHARDS}); do
                            kubectl delete job playwright-test-\$i --namespace=${NAMESPACE} --ignore-not-found
                        done
                    '''
                    
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

        stage('Copy Allure Results from K8s') {
            steps {
                script {
                    sh """
                        mkdir -p allure-results/merged
                        for i in \$(seq 1 ${TOTAL_SHARDS}); do
                            POD_NAME=\$(kubectl get pods --namespace=${NAMESPACE} -l job-name=playwright-test-\$i -o jsonpath='{.items[0].metadata.name}')
                            mkdir -p allure-results/shard-\$i
                            kubectl cp ${NAMESPACE}/\$POD_NAME:/app/allure-results allure-results/shard-\$i
                            cp -r allure-results/shard-\$i/* allure-results/merged/
                        done
                    """
                }
            }
        }

        stage('Generate Allure Report') {
            steps {
                sh """
                    allure generate allure-results/merged --clean -o allure-report
                """
            }
        }

        stage('Publish Allure Report in Jenkins') {
            steps {
                allure([
                    includeProperties: false,
                    jdk: '',
                    results: [[path: 'allure-results/merged']]
                ])
            }
        }

    }
}

