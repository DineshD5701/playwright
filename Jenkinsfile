pipeline {
    agent any

    environment {
        NAMESPACE = "default"
        TOTAL_SHARDS = 4
        DOCKER_IMAGE = "dinesh571/playwright:latest"
        PVC_NAME = "playwright-pvc"
        GCHAT_WEBHOOK = credentials('GCHAT_WEBHOOK')  // stored as Jenkins secret
    }

    stages {
        stage('Build and Deploy Playwright Tests') {
            steps {
                script {
                    for (int i = 1; i <= env.TOTAL_SHARDS.toInteger(); i++) {
                        sh """
                        sed "s/{{SHARD_ID}}/${i}/g; \
                             s/{{TOTAL_SHARDS}}/${TOTAL_SHARDS}/g; \
                             s|{{DOCKER_IMAGE}}|${DOCKER_IMAGE}|g; \
                             s|{{PVC_NAME}}|${PVC_NAME}|g; \
                             s|{{PVC_MOUNT_PATH}}|/app/allure-results|g" \
                             k8s/playwright-job.yml | kubectl apply --namespace=${NAMESPACE} -f -
                        """
                    }
                }
            }
        }

        stage('Wait for Jobs to Finish') {
            steps {
                sh '''
                kubectl wait --for=condition=complete --timeout=600s jobs --all -n ${NAMESPACE} || true
                '''
            }
        }

        stage('Fetch Allure Results') {
            steps {
                sh '''
                kubectl delete pod allure-fetch --namespace=${NAMESPACE} --ignore-not-found
                kubectl run allure-fetch --namespace=${NAMESPACE} \
                  --restart=Never --image=alpine:3.18 \
                  --overrides='{
                      "spec": {
                          "containers": [{
                              "name": "fetch",
                              "image": "alpine:3.18",
                              "command": ["sh", "-c", "sleep 30"],
                              "volumeMounts": [{
                                  "mountPath": "/app/allure-results",
                                  "name": "allure-results"
                              }]
                          }],
                          "volumes": [{
                              "name": "allure-results",
                              "persistentVolumeClaim": {"claimName": "${PVC_NAME}"}
                          }]
                      }
                  }'

                kubectl wait --for=condition=Ready pod/allure-fetch --namespace=${NAMESPACE} --timeout=120s
                kubectl cp ${NAMESPACE}/allure-fetch:/app/allure-results ./allure-results
                '''
            }
        }

        stage('Generate Allure Report') {
            steps {
                sh '''
                allure generate ./allure-results -o ./allure-report --clean
                '''
            }
        }

        stage('Publish Allure Report in Jenkins') {
            steps {
                allure includeProperties: false, jdk: '', results: [[path: 'allure-results']]
            }
        }

        stage('Send Google Chat Notification') {
            steps {
                script {
                    sh '''
                    apt-get update && apt-get install -y jq curl

                    PASSED=$(jq .statistic.passed allure-results/widgets/summary.json)
                    FAILED=$(jq .statistic.failed allure-results/widgets/summary.json)
                    BROKEN=$(jq .statistic.broken allure-results/widgets/summary.json)
                    SKIPPED=$(jq .statistic.skipped allure-results/widgets/summary.json)
                    TOTAL=$(jq .statistic.total allure-results/widgets/summary.json)

                    DURATION=$(jq .time.duration allure-results/widgets/summary.json)
                    DURATION_MIN=$((DURATION / 60000))
                    DURATION_SEC=$(((DURATION % 60000) / 1000))

                    STATUS="✅ SUCCESS"
                    if [ "$FAILED" -gt 0 ] || [ "$BROKEN" -gt 0 ]; then
                      STATUS="❌ FAILED"
                    fi

                    MESSAGE="*Playwright Test Summary*\\n
                    Status: ${STATUS}\\n
                    Passed: ${PASSED}\\n
                    Failed: ${FAILED}\\n
                    Broken: ${BROKEN}\\n
                    Skipped: ${SKIPPED}\\n
                    Total: ${TOTAL}\\n
                    Duration: ${DURATION_MIN}m ${DURATION_SEC}s"

                    curl -X POST -H 'Content-Type: application/json' \
                      --data "{\\"text\\": \\"${MESSAGE}\\"}" \
                      $GCHAT_WEBHOOK
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'kubectl delete pod allure-fetch --namespace=${NAMESPACE} --ignore-not-found'
        }
    }
}
