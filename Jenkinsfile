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

        // stage('Build & Push Docker Image') {
        //     steps {
        //         script {
        //             withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
        //                 sh '''
        //                     echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin
        //                     docker build -t $DOCKER_IMAGE .
        //                     docker push $DOCKER_IMAGE
        //                 '''
        //             }
        //         }
        //     }
        // }

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

        stage('Clean Allure PVC') {
            steps {
                script {
                    sh """
                    # Delete old results from PVC using a temporary pod
                    kubectl delete pod allure-clean --namespace=${NAMESPACE} --ignore-not-found
                    kubectl run allure-clean --namespace=${NAMESPACE} \
                        --image=busybox:1.36 --restart=Never \
                        --overrides='
                        {
                            "apiVersion": "v1",
                            "spec": {
                                "containers": [{
                                    "name": "allure-clean",
                                    "image": "busybox:1.36",
                                    "command": ["sh", "-c", "rm -rf /app/allure-results/*"],
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
        
                    echo "Waiting for allure-clean pod to finish..."
                    kubectl wait --for=condition=Succeeded pod/allure-clean --namespace=${NAMESPACE} --timeout=60s || true
        
                    echo "Ensure pod is fully terminated..."
                    kubectl delete pod allure-clean --namespace=${NAMESPACE} --wait=true --ignore-not-found
                    """
                }
            }
        }

        
        stage('Run Playwright Jobs in K8s') {
            steps {
                script {
                    // Clean up old jobs
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
                    echo "Waiting for Playwright jobs to finish..."
                    kubectl wait --for=condition=complete --timeout=900s job --all --namespace=${NAMESPACE} || true
                """
            }
        }

        stage('Copy Allure Results from K8s') {
            steps {
                script {
                    sh """
                        # Clean old results in workspace
                        rm -rf allure-results
                        mkdir -p allure-results/merged

                        # Delete old fetch pod if exists
                        kubectl delete pod allure-fetch --namespace=${NAMESPACE} --ignore-not-found

                        # Start a temporary pod with PVC mounted
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

                        # Wait for pod ready
                        kubectl wait --for=condition=Ready pod/allure-fetch --namespace=${NAMESPACE} --timeout=60s

                        # Copy results from PVC via the fetch pod
                        kubectl cp ${NAMESPACE}/allure-fetch:/app/allure-results allure-results/merged

                        # Cleanup fetch pod
                        kubectl delete pod allure-fetch --namespace=${NAMESPACE}
                    """
                }
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

        stage('Publish to GitHub Pages') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'github-token', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                        sh """
                          git config --global user.email "ci-bot@example.com"
                          git config --global user.name "CI Bot"
                          rm -rf gh-pages
                          git clone https://${GIT_USER}:${GIT_PASS}@github.com/dineshd5701/playwright.git -b gh-pages gh-pages
                          rm -rf gh-pages/*
                          cp -r allure-report/* gh-pages/
                          cd gh-pages
                          git add .
                          git commit -m "Update Allure Report for Build #${BUILD_NUMBER}" || echo "No changes to commit"
                          git push origin gh-pages
                        """
                    }
                }
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

                        def reportUrl = "https://dineshd5701.github.io/playwright/"
                        def status = currentBuild.currentResult

                        sh '''
                        curl -X POST -H 'Content-Type: application/json' \
                        -d '{
                          "text": "🚀 *Playwright Test Suite Completed* 🚀\\\\n🧪 *Total:* ${total}\\\\n✅ *Passed:* ${passed}\\\\n❌ *Failed:* ${failed}\\\\n⚠️ *Broken:* ${broken}\\\\n⏭️ *Skipped:* ${skipped}\\\\n📊 *Status:* ${status}\\\\n🔗 *Report:* ${reportUrl}"
                        }' \
                        $GCHAT_WEBHOOK
                        '''
                    }
                }
            }
        }
    }
}


