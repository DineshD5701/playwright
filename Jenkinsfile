pipeline {
    agent any

    environment {
        NAMESPACE       = "default"
        TOTAL_SHARDS    = 4
        DOCKER_IMAGE    = "dinesh571/playwright:latest"
        PVC_NAME        = "playwright-pvc"
        GCHAT_WEBHOOK   = credentials('GCHAT_WEBHOOK')  // stored in Jenkins Credentials
    }

    stages {
        stage('Run Playwright Tests in K8s') {
            steps {
                script {
                    for (int i = 1; i <= TOTAL_SHARDS.toInteger(); i++) {
                        sh """
                        kubectl delete pod playwright-test-${i} --namespace=${NAMESPACE} --ignore-not-found
                        kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: playwright-test-${i}
  namespace: ${NAMESPACE}
spec:
  restartPolicy: Never
  containers:
  - name: playwright
    image: ${DOCKER_IMAGE}
    command: ["npx","playwright","test","--shard","${i}/${TOTAL_SHARDS}","--reporter","line,allure-playwright"]
    volumeMounts:
    - name: results
      mountPath: /app/allure-results
  volumes:
  - name: results
    persistentVolumeClaim:
      claimName: ${PVC_NAME}
EOF
                        """
                    }
                }
            }
        }

        stage('Wait for Test Completion') {
            steps {
                script {
                    for (int i = 1; i <= TOTAL_SHARDS.toInteger(); i++) {
                        sh "kubectl wait --for=condition=Ready pod/playwright-test-${i} --namespace=${NAMESPACE} --timeout=900s"
                        sh "kubectl logs pod/playwright-test-${i} --namespace=${NAMESPACE}"
                    }
                }
            }
        }

        stage('Fetch Allure Results') {
            steps {
                sh """
                kubectl delete pod allure-fetch --namespace=${NAMESPACE} --ignore-not-found
                kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: allure-fetch
  namespace: ${NAMESPACE}
spec:
  restartPolicy: Never
  containers:
  - name: fetch
    image: alpine:latest
    command: ["/bin/sh", "-c"]
    args: ["sleep 30"]
    volumeMounts:
    - name: results
      mountPath: /data
  volumes:
  - name: results
    persistentVolumeClaim:
      claimName: ${PVC_NAME}
EOF
                """

                sh "kubectl wait --for=condition=Ready pod/allure-fetch --namespace=${NAMESPACE} --timeout=120s"
                sh "kubectl cp ${NAMESPACE}/allure-fetch:/data ./allure-results"
            }
        }

        stage('Generate Allure Report') {
            steps {
                sh """
                npx allure generate allure-results --clean -o allure-report
                """
            }
        }

        stage('Send GChat Notification') {
            steps {
                sh """
                apt-get update && apt-get install -y jq curl

                if [ -f allure-report/widgets/summary.json ]; then
                  PASSED=\$(jq .statistic.passed allure-report/widgets/summary.json)
                  FAILED=\$(jq .statistic.failed allure-report/widgets/summary.json)
                  TOTAL=\$(jq .statistic.total allure-report/widgets/summary.json)
                  MESSAGE="Playwright Test Summary: Total=\$TOTAL, Passed=\$PASSED, Failed=\$FAILED"
                  curl -X POST -H 'Content-Type: application/json' \
                    -d "{\\"text\\": \\"\\$MESSAGE\\"}" \
                    "$GCHAT_WEBHOOK"
                else
                  echo "summary.json not found after report generation!"
                  exit 1
                fi
                """
            }
        }
    }

    post {
        always {
            junit '**/test-results/*.xml'  // optional if you export junit format
            archiveArtifacts artifacts: 'allure-results/**', allowEmptyArchive: true
            archiveArtifacts artifacts: 'allure-report/**', allowEmptyArchive: true
        }
    }
}
