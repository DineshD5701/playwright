pipeline {
    agent any

    environment {
        NAMESPACE        = "default"
        TOTAL_SHARDS     = 4
        KUBECONFIG_CONTENT = credentials('KUBECONFIG_CONTENT')
        DOCKER_IMAGE     = "dinesh571/playwrights:latest"
        PVC_NAME         = "allure-pvc"
        GCHAT_WEBHOOK    = credentials('GCHAT_WEBHOOK') // Jenkins secret for webhook
    }

    stages {

        stage('Build & Push Docker Image') {
            when {
                changeset "Dockerfile, **/Dockerfile, package*.json, **/package*.json"
            }
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

        stage('Publish Allure Report in Jenkins') {
            steps {
                allure([
                    includeProperties: false,
                    jdk: '',
                    results: [[path: 'allure-results/merged']]
                ])
            }
        }

        stage('Send Report to Google Chat') {
            steps {
                script {
                    def summaryJson = readJSON file: 'allure-results/merged/widgets/summary.json'
                    def stats = summaryJson.statistic

                    def passed  = stats.passed ?: 0
                    def failed  = stats.failed ?: 0
                    def broken  = stats.broken ?: 0
                    def skipped = stats.skipped ?: 0
                    def total   = stats.total ?: 0
                    def time    = summaryJson.time.duration ?: 0

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

                    👉 Full Allure report available in Jenkins UI
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
}
