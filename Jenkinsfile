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
        //         withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
        //             sh '''
        //                 echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin
        //                 docker build -t $DOCKER_IMAGE .
        //             '''
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

        stage('Ensure Allure PVC') {
            steps {
                sh 'kubectl apply -f k8s/allure-pvc.yml --namespace=${NAMESPACE}'
            }
        }

        stage('Run Playwright Jobs in K8s') {
            steps {
                script {
                    // Clean up old jobs
                    sh 'kubectl delete jobs --all --namespace=${NAMESPACE} --ignore-not-found'

                    // Create jobs in parallel
                    def shards = [:]
                    for (int i = 1; i <= TOTAL_SHARDS.toInteger(); i++) {
                        def shardId = i
                        shards["Shard-${i}"] = {
                            sh """
                                sed "s/{{SHARD_ID}}/${shardId}/g; \
                                    s/{{TOTAL_SHARDS}}/${TOTAL_SHARDS}/g; \
                                    s|{{DOCKER_IMAGE}}|${DOCKER_IMAGE}|g; \
                                    s|{{PVC_NAME}}|${PVC_NAME}|g; \
                                    s|{{PVC_MOUNT_PATH}}|/app/allure-results|g" \
                                k8s/playwright-job.yml | kubectl apply --namespace=${NAMESPACE} -f -
                            """
                        }
                    }
                    parallel shards
                }
            }
        }

        stage('Wait for Jobs to Complete') {
            steps {
                sh 'kubectl wait --for=condition=complete --timeout=900s job --all --namespace=${NAMESPACE} || true'
            }
        }

        stage('Copy Allure Results') {
            steps {
                sh '''
                    rm -rf allure-results && mkdir -p allure-results/merged

                    # Use a fetch pod to access PVC
                    kubectl delete pod allure-fetch --namespace=${NAMESPACE} --ignore-not-found
                    kubectl run allure-fetch --namespace=${NAMESPACE} \
                        --image=busybox:1.36 --restart=Never \
                        --overrides='{
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
                '''
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
                withCredentials([usernamePassword(credentialsId: 'github-token', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                    sh '''
                        git config --global user.email "ci-bot@example.com"
                        git config --global user.name "CI Bot"

                        rm -rf playwright-allure-report
                        git clone https://${GIT_USER}:${GIT_PASS}@github.com/${GIT_REPO}.git -b playwright-allure-report playwright-allure-report

                        mkdir -p playwright-allure-report/build-${BUILD_NUMBER}
                        cp -r allure-report/* playwright-allure-report/build-${BUILD_NUMBER}/

                        cd playwright-allure-report
                        git add .
                        git diff-index --quiet HEAD || git commit -m "🚀 Update Allure Report for Build #${BUILD_NUMBER}"
                        git push origin playwright-allure-report
                    '''
                }
            }
        }

        stage('Notify Google Chat') {
            steps {
                withCredentials([string(credentialsId: 'GCHAT_WEBHOOK', variable: 'GCHAT_WEBHOOK')]) {
                    script {
                        def total   = sh(script: "jq .statistic.total allure-report/widgets/summary.json || echo 0", returnStdout: true).trim()
                        def failed  = sh(script: "jq .statistic.failed allure-report/widgets/summary.json || echo 0", returnStdout: true).trim()
                        def broken  = sh(script: "jq .statistic.broken allure-report/widgets/summary.json || echo 0", returnStdout: true).trim()
                        def passed  = sh(script: "jq .statistic.passed allure-report/widgets/summary.json || echo 0", returnStdout: true).trim()

                        def status = currentBuild.currentResult
                        def emoji = status == "SUCCESS" ? "✅" :
                                    status == "FAILURE" ? "❌" :
                                    status == "UNSTABLE" ? "⚠️" : "🚀"

                        def reportUrl = "https://${GIT_REPO.split('/')[0]}.github.io/playwright/build-${BUILD_NUMBER}/"

                        sh """
                        curl -X POST -H "Content-Type: application/json" \
                        -d '{
                          "text": "${emoji} *Playwright Test Suite Completed* ${emoji}\\n🧪 *Total:* ${total}\\n✅ *Passed:* ${passed}\\n❌ *Failed:* ${failed}\\n⚠️ *Broken:* ${broken}\\n📊 *Status:* ${status}\\n🔧 *Build:* #${BUILD_NUMBER}\\n🔗 *Report:* ${reportUrl}"
                        }' "$GCHAT_WEBHOOK"
                        """
                    }
                }
            }
        }
    }
}
