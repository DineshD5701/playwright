pipeline {
    agent any

    environment {
        NAMESPACE       = "default"
        TOTAL_SHARDS    = 4
        DOCKER_IMAGE    = "playwright-local:latest"
        PVC_NAME        = "allure-pvc"
        PVC_MOUNT_PATH  = "/app/allure-results"
        GCHAT_WEBHOOK   = credentials('GCHAT_WEBHOOK')  // stored in Jenkins credentials
    }

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/DineshD5701/playwright.git',
                    credentialsId: 'github-token'
            }
        }


        stage('Build Docker Image') {
            steps {
                sh 'docker build -t ${DOCKER_IMAGE} .'
            }
        }

        stage('Run Playwright Tests on K8s') {
            steps {
                script {
                    for (int i = 1; i <= env.TOTAL_SHARDS.toInteger(); i++) {
                        sh """
                        sed "s/{{SHARD_ID}}/${i}/g; \
                             s/{{TOTAL_SHARDS}}/${TOTAL_SHARDS}/g; \
                             s|{{DOCKER_IMAGE}}|${DOCKER_IMAGE}|g; \
                             s|{{PVC_NAME}}|${PVC_NAME}|g; \
                             s|{{PVC_MOUNT_PATH}}|${PVC_MOUNT_PATH}|g" \
                        k8s/playwright-job.yml | kubectl apply --namespace=${NAMESPACE} -f -
                        """
                    }
                }
            }
        }

        stage('Wait for Jobs') {
            steps {
                sh '''
                kubectl wait --for=condition=complete --timeout=900s job -l job-group=playwright --namespace=${NAMESPACE}
                '''
            }
        }

        stage('Collect Allure Results') {
            steps {
                sh '''
                rm -rf allure-results
                kubectl cp ${NAMESPACE}/$(kubectl get pod -n ${NAMESPACE} -l job-name=playwright-test-1 -o jsonpath='{.items[0].metadata.name}'):${PVC_MOUNT_PATH} allure-results
                '''
            }
        }

        stage('Generate Allure Report') {
            steps {
                sh 'allure generate allure-results -o allure-report --clean'
            }
        }

        stage('Send Report to GChat') {
            steps {
                script {
                    def summaryJson = readJSON file: 'allure-report/widgets/summary.json'
                    def stats = summaryJson.statistic

                    def passed = stats.passed ?: 0
                    def failed = stats.failed ?: 0
                    def broken = stats.broken ?: 0
                    def skipped = stats.skipped ?: 0
                    def total  = stats.total ?: 0
                    def time   = summaryJson.time.duration ?: 0

                    // convert ms to min:sec
                    def durationMin = (time / 60000).intValue()
                    def durationSec = ((time % 60000) / 1000).intValue()

                    def message = """
                    *Playwright Test Execution Summary*
                    Total: ${total}
                    ✅ Passed: ${passed}
                    ❌ Failed: ${failed}
                    ⚠️ Broken: ${broken}
                    ⏭ Skipped: ${skipped}
                    ⏱ Duration: ${durationMin}m ${durationSec}s

                    👉 Full report available in Jenkins build artifacts.
                    """

                    def payload = """{ "text": "${message}" }"""

                    sh """
                    curl -X POST -H 'Content-Type: application/json' \
                         -d '${payload}' ${GCHAT_WEBHOOK}
                    """
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'allure-report/**', fingerprint: true
        }
    }
}
