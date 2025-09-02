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

        stage('Copy Allure Results from K8s (robust)') {
            steps {
                script {
                    sh """
                        # prepare local dir
                        rm -rf allure-results
                        mkdir -p allure-results/merged

                        # cleanup any old helper pod
                        kubectl delete pod allure-fetch --namespace=${NAMESPACE} --ignore-not-found

                        # create a temporary pod with PVC mounted
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

                        # Use tar piped through kubectl exec -> local tar to copy CONTENTS (avoids nested folder issues)
                        kubectl exec --namespace=${NAMESPACE} allure-fetch -- tar -C /app/allure-results -cf - . | tar -C allure-results/merged -xvf - || true

                        # Fallback: try kubectl cp with a trailing dot to copy contents (some K8s versions behave differently)
                        if [ \$(find allure-results/merged -maxdepth 1 -type f | wc -l) -eq 0 ]; then
                          kubectl cp ${NAMESPACE}/allure-fetch:/app/allure-results/. allure-results/merged || kubectl cp ${NAMESPACE}/allure-fetch:/app/allure-results allure-results/merged || true
                        fi

                        # Cleanup fetch pod
                        kubectl delete pod allure-fetch --namespace=${NAMESPACE} --ignore-not-found

                        # Diagnostics - list what's been copied
                        echo "---- listing merged directory (top-level) ----"
                        ls -la allure-results/merged || true
                        echo "---- json files (first 200) ----"
                        find allure-results/merged -type f -name '*.json' | sed -n '1,200p' || true
                        echo "---- xml files (first 200) ----"
                        find allure-results/merged -type f -name '*.xml' | sed -n '1,200p' || true
                        SAMPLE=\$(find allure-results/merged -type f \( -name '*.json' -o -name '*.xml' \) | head -1 || true)
                        echo "SAMPLE FILE -> \$SAMPLE"
                        [ -n "\$SAMPLE" ] && head -n 200 "\$SAMPLE" | sed -n '1,200p' || true
                    """
                }
            }
        }

        stage('Publish Allure Report in Jenkins') {
            steps {
                // publish whatever was copied under allure-results/merged
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

                        // Parse results (JSON preferred, fallback to XML/JUnit)
                        sh """
                            set +e
                            # try to install jq if available (no-op on non-debian agents)
                            apt-get update -y 2>/dev/null || true
                            apt-get install -y jq 2>/dev/null || true

                            JSON_COUNT=\$(find allure-results/merged -type f -name '*.json' | wc -l)
                            XML_COUNT=\$(find allure-results/merged -type f -name '*.xml' | wc -l)
                            echo "Found JSON=\$JSON_COUNT XML=\$XML_COUNT"

                            if [ "\$JSON_COUNT" -gt 0 ]; then
                              # use jq - slurp files and count by status
                              TOTAL=\$(jq -s 'length' allure-results/merged/*.json 2>/dev/null || echo 0)
                              PASSED=\$(jq -s 'map(select(.status==\"passed\")) | length' allure-results/merged/*.json 2>/dev/null || echo 0)
                              FAILED=\$(jq -s 'map(select(.status==\"failed\")) | length' allure-results/merged/*.json 2>/dev/null || echo 0)
                              BROKEN=\$(jq -s 'map(select(.status==\"broken\")) | length' allure-results/merged/*.json 2>/dev/null || echo 0)
                              SKIPPED=\$(jq -s 'map(select(.status==\"skipped\")) | length' allure-results/merged/*.json 2>/dev/null || echo 0)

                              FAILED_TESTS=\$(jq -r -s 'map(select(.status==\"failed\")) | .[]? | .name' allure-results/merged/*.json 2>/dev/null | head -5)
                            elif [ "\$XML_COUNT" -gt 0 ]; then
                              # fallback to parsing junit xml (first testsuite attrs)
                              TS_LINE=\$(grep -o '<testsuite [^>]*>' allure-results/merged/*.xml | head -1 || true)
                              TESTS=\$(echo "\$TS_LINE" | grep -o 'tests=\"[0-9]*\"' | grep -o '[0-9]*' || echo 0)
                              FAILURES=\$(echo "\$TS_LINE" | grep -o 'failures=\"[0-9]*\"' | grep -o '[0-9]*' || echo 0)
                              ERRORS=\$(echo "\$TS_LINE" | grep -o 'errors=\"[0-9]*\"' | grep -o '[0-9]*' || echo 0)
                              SKIPPED=\$(echo "\$TS_LINE" | grep -o 'skipped=\"[0-9]*\"' | grep -o '[0-9]*' || echo 0)
                              PASSED=\$((TESTS - FAILURES - ERRORS - SKIPPED))
                              TOTAL=\$TESTS

                              FAILED_TESTS=\$(awk -F'\"' '/<testcase /{name=\$2} /<(failure|error)/{print name}' allure-results/merged/*.xml | head -5)
                            else
                              TOTAL=0; PASSED=0; FAILED=0; BROKEN=0; SKIPPED=0; FAILED_TESTS=""
                            fi

                            if [ -z "\$FAILED_TESTS" ]; then
                              FAILED_TESTS="- None"
                            else
                              # format for chat (escape newlines)
                              FAILED_TESTS=\$(echo "\$FAILED_TESTS" | sed 's/^/- /' | sed ':a;N;$!ba;s/\\n/\\\\n/g')
                            fi

                            # Build JSON message for Google Chat
                            MESSAGE="{
                              \\"text\\": \\"🚀 Playwright Test Suite Completed\\\\n🧪 Total: \${TOTAL}\\\\n✅ Passed: \${PASSED}\\\\n❌ Failed: \${FAILED}\\\\n⚠️ Broken: \${BROKEN}\\\\n⏭️ Skipped: \${SKIPPED}\\\\n🔴 Failed Tests:\\\\n\${FAILED_TESTS}\\\\n📊 Allure Report: ${allureReportUrl}\\"
                            }"

                            curl -s -X POST -H 'Content-Type: application/json' -d "\$MESSAGE" "$GCHAT_URL" || true
                            set -e
                        """
                    }
                }
            }
        }
    }
}
