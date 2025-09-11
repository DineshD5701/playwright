pipeline {
    agent any

    environment {
        NAMESPACE = "default"
        TOTAL_SHARDS = 4
        DOCKER_IMAGE = "dinesh571/playwright:latest"
        PVC_NAME = "allure-pvc"
        KUBECONFIG_CONTENT = credentials('KUBECONFIG_CONTENT')
    }

    stages {

        stage('Build & Push Docker Image') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
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
                    // Cleanup old jobs
                    sh '''
                        for i in $(seq 1 ${TOTAL_SHARDS}); do
                            kubectl delete job playwright-test-$i --namespace=${NAMESPACE} --ignore-not-found
                        done
                    '''
                    // Launch shards
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
                    echo "⏳ Waiting for Playwright jobs to finish..."
                    kubectl wait --for=condition=complete --timeout=900s job --all --namespace=${NAMESPACE} || true
                """
            }
        }

        stage('Copy Allure Results from K8s') {
            steps {
                script {
                    sh """
                        rm -rf allure-results
                        mkdir -p allure-results/merged
                        kubectl delete pod allure-fetch --namespace=${NAMESPACE} --ignore-not-found

                        kubectl run allure-fetch --namespace=${NAMESPACE} \
                        --image=busybox:1.36 --restart=Never \
                        --overrides='
                        {
                            "apiVersion": "v1",
                            "spec": {
                            "containers": [{
                                "name": "allure-fetch",
                                "image": "busybox:1.36",
                                "command": ["sleep", "3600"],
                                "volumeMounts": [{
                                "mountPath": "/app/allure-results",
                                "name": "allure-results"
                                }]
                            }],
                            "volumes": [{
                                "name": "allure-results",
                                "persistentVolumeClaim": {
                                "claimName": "${PVC_NAME}"
                                }
                            }]
                            }
                        }'

                        kubectl wait --for=condition=Ready pod/allure-fetch --namespace=${NAMESPACE} --timeout=60s
                        kubectl cp ${NAMESPACE}/allure-fetch:/app/allure-results allure-results/merged
                        kubectl delete pod allure-fetch --namespace=${NAMESPACE}
                    """
                }
            }
        }

        stage('Publish Allure Report') {
            steps {
                allure([
                    includeProperties: false,
                    jdk: '',
                    results: [[path: 'allure-results/merged']]
                ])
            }
        }

        stage('Notify Google Chat') {
        steps {
            withCredentials([string(credentialsId: 'GCHAT_WEBHOOK', variable: 'GCHAT_WEBHOOK')]) {
                script {
                    def total = sh(script: "grep -o '\"total\":[0-9]*' allure-report/widgets/summary.json | grep -o '[0-9]*' || echo 0", returnStdout: true).trim()
                    def failed = sh(script: "grep -o '\"failed\":[0-9]*' allure-report/widgets/summary.json | grep -o '[0-9]*' || echo 0", returnStdout: true).trim()
                    def broken = sh(script: "grep -o '\"broken\":[0-9]*' allure-report/widgets/summary.json | grep -o '[0-9]*' || echo 0", returnStdout: true).trim()
                    def skipped = sh(script: "grep -o '\"skipped\":[0-9]*' allure-report/widgets/summary.json | grep -o '[0-9]*' || echo 0", returnStdout: true).trim()
                    def passed = sh(script: "grep -o '\"passed\":[0-9]*' allure-report/widgets/summary.json | grep -o '[0-9]*' || echo 0", returnStdout: true).trim()
    
                    def reportUrl = "https://7503742845ed.ngrok-free.app/job/${env.JOB_NAME}/${env.BUILD_NUMBER}/allure"
                    def status = currentBuild.currentResult
    
                    // Send notification safely
                    sh '''
                    curl -X POST -H "Content-Type: application/json" \
                    -d "{
                      \\"text\\": \\"🚀 *Playwright Test Suite Completed* 🚀\\\\n🧪 *Total:* ''' + total + '''\\\\n✅ *Passed:* ''' + passed + '''\\\\n❌ *Failed:* ''' + failed + '''\\\\n⚠️ *Broken:* ''' + broken + '''\\\\n⏭️ *Skipped:* ''' + skipped + '''\\\\n📊 *Status:* ''' + status + '''\\\\n🔗 *Report:* ''' + reportUrl + '''\\"
                    }" \
                    "$GCHAT_WEBHOOK"
                    '''
                    }
                }
            }
        }
    }
}
