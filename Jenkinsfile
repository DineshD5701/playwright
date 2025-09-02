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
                    sh '''
                        for i in $(seq 1 ${TOTAL_SHARDS}); do
                            kubectl delete job playwright-test-$i --namespace=${NAMESPACE} --ignore-not-found
                        done
                    '''

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

        stage('Send Report Summary to Google Chat') {
            steps {
                withCredentials([string(credentialsId: 'GCHAT_WEBHOOK', variable: 'GCHAT_URL')]) {
                    script {
                        def allureReportUrl = "${env.BUILD_URL}allure/"

                        sh '''
                            set +e
                            # Parse Allure test results JSON
                            TOTAL=$(jq '. | length' allure-results/merged/*.json 2>/dev/null | awk '{s+=$1} END {print s}')
                            FAILED=$(jq -r 'select(.status=="failed") | .name' allure-results/merged/*.json 2>/dev/null | wc -l)
                            BROKEN=$(jq -r 'select(.status=="broken") | .name' allure-results/merged/*.json 2>/dev/null | wc -l)
                            SKIPPED=$(jq -r 'select(.status=="skipped") | .name' allure-results/merged/*.json 2>/dev/null | wc -l)
                            PASSED=$(jq -r 'select(.status=="passed") | .name' allure-results/merged/*.json 2>/dev/null | wc -l)

                            # Get names of first 5 failed tests
                            FAILED_TESTS=$(jq -r 'select(.status=="failed") | .name' allure-results/merged/*.json 2>/dev/null | head -5)
                            FAILED_TESTS=$(echo "$FAILED_TESTS" | sed 's/^/- /' || echo "- None")

                            MESSAGE="{
                              \\"text\\": \\"🚀 *Playwright Test Suite Completed* 🚀\\\\n
                              🧪 *Total:* $TOTAL\\\\n
                              ✅ *Passed:* $PASSED\\\\n
                              ❌ *Failed:* $FAILED\\\\n
                              ⚠️ *Broken:* $BROKEN\\\\n
                              ⏭️ *Skipped:* $SKIPPED\\\\n
                              🔴 *Failed Tests:*\\\\n$FAILED_TESTS\\\\n
                              📊 *Allure Report:* ${allureReportUrl}\\"
                            }"

                            curl -X POST -H 'Content-Type: application/json' -d "$MESSAGE" "$GCHAT_URL"
                            set -e
                        '''
                    }
                }
            }
        }
    }
}
