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
                        # Clean old results
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

        // Optional but recommended: generate local HTML so we can read summary.json if needed
        stage('Generate Local Allure HTML (optional)') {
            steps {
                sh """
                    if ! command -v allure >/dev/null 2>&1; then
                        echo "Allure CLI not found (that is OK, skipping local HTML gen)."
                    else
                        allure generate allure-results/merged --clean -o allure-report || true
                    fi
                """
            }
        }

        stage('Send Report Summary to Google Chat') {
            steps {
                withCredentials([string(credentialsId: 'GCHAT_WEBHOOK', variable: 'GCHAT_URL')]) {
                    script {
                        def allureReportUrl = "${env.BUILD_URL}allure/"

                        // Try to ensure jq is available
                        sh """
                            set +e
                            if ! command -v jq >/dev/null 2>&1; then
                              if command -v apt-get >/dev/null 2>&1; then
                                sudo apt-get update && sudo apt-get install -y jq
                              elif command -v yum >/dev/null 2>&1; then
                                sudo yum install -y jq
                              elif command -v apk >/dev/null 2>&1; then
                                sudo apk add jq
                              else
                                echo "jq not found and package manager unknown; proceeding without it."
                              fi
                            fi
                            set -e
                        """

                        // Accurate Allure parsing: ONLY *-result.json have test status
                        sh """
                            set +e

                            RESULT_GLOB="allure-results/merged/*-result.json"

                            if ls \$RESULT_GLOB >/dev/null 2>&1; then
                              TOTAL=\$(ls -1 \$RESULT_GLOB | wc -l | awk '{print \$1}')

                              PASSED=\$(jq -r 'if .status==\"passed\" then 1 else empty end' \$RESULT_GLOB 2>/dev/null | wc -l | awk '{print \$1}')
                              FAILED=\$(jq -r 'if .status==\"failed\" then 1 else empty end' \$RESULT_GLOB 2>/dev/null | wc -l | awk '{print \$1}')
                              BROKEN=\$(jq -r 'if .status==\"broken\" then 1 else empty end' \$RESULT_GLOB 2>/dev/null | wc -l |_
