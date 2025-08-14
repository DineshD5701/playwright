pipeline {
    agent any

    environment {
        // Store kubeconfig content as a Jenkins secret
        KUBECONFIG_CONTENT = credentials('KUBECONFIG_CONTENT')
        DOCKER_IMAGE = "dinesh571/playwright:latest"
        TOTAL_SHARDS = "4"
        PVC_NAME = "allure-results-pvc"
        PVC_MOUNT_PATH = "/app/allure-results"
    }

    stages {
        stage('Setup Kubeconfig') {
            steps {
                script {
                    sh '''
                        echo "$KUBECONFIG_CONTENT" | base64 -d > kubeconfig
                        export KUBECONFIG=$(pwd)/kubeconfig
                        kubectl config get-contexts
                        kubectl cluster-info
                    '''
                }
            }
        }

        stage('Deploy Allure PVC') {
            steps {
                script {
                    sh '''
                        export KUBECONFIG=$(pwd)/kubeconfig
                        kubectl apply -f k8s/allure-pvc.yml
                    '''
                }
            }
        }

        stage('Deploy Playwright Jobs') {
            steps {
                script {
                    sh '''
                        export KUBECONFIG=$(pwd)/kubeconfig
                        for i in $(seq 1 $TOTAL_SHARDS); do
                          sed "s/{{SHARD_ID}}/$i/g; \
                               s/{{TOTAL_SHARDS}}/$TOTAL_SHARDS/g; \
                               s|{{DOCKER_IMAGE}}|$DOCKER_IMAGE|g; \
                               s|{{PVC_NAME}}|$PVC_NAME|g; \
                               s|{{PVC_MOUNT_PATH}}|$PVC_MOUNT_PATH|g" \
                          k8s/playwright-job.yml \
                          | kubectl apply -f -
                        done
                    '''
                }
            }
        }

        stage('Wait for Jobs to Complete') {
            steps {
                script {
                    sh '''
                        export KUBECONFIG=$(pwd)/kubeconfig
                        echo "Waiting for Playwright jobs to finish..."
                        kubectl wait --for=condition=complete job --all --timeout=1200s || true
                    '''
                }
            }
        }

        stage('Fetch Allure Results from PVC') {
            steps {
                script {
                    sh '''
                        export KUBECONFIG=$(pwd)/kubeconfig
                        mkdir -p allure-results

                        # Create a temporary pod to copy PVC contents
                        kubectl run allure-fetch --restart=Never --image=alpine:3.18 -i --overrides="$(cat <<EOF
{
  "apiVersion": "v1",
  "spec": {
    "containers": [
      {
        "name": "fetch",
        "image": "alpine:3.18",
        "command": ["sleep", "300"],
        "volumeMounts": [
          {
            "name": "allure-results",
            "mountPath": "$PVC_MOUNT_PATH"
          }
        ]
      }
    ],
    "volumes": [
      {
        "name": "allure-results",
        "persistentVolumeClaim": {
          "claimName": "$PVC_NAME"
        }
      }
    ]
  }
}
EOF
)" >/dev/null 2>&1

                        # Wait for pod to be running
                        kubectl wait --for=condition=Ready pod/allure-fetch --timeout=60s

                        # Copy results
                        kubectl cp allure-fetch:$PVC_MOUNT_PATH ./allure-results

                        # Cleanup temp pod
                        kubectl delete pod allure-fetch
                    '''
                }
            }
        }

        stage('Generate Allure Report') {
            steps {
                script {
                    sh '''
                        npx allure generate allure-results --clean -o allure-report
                        # You can archive it instead of opening for CI/CD use
                        tar -czf allure-report.tar.gz allure-report
                        echo "Allure report generated and archived"
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'rm -f kubeconfig'
            archiveArtifacts artifacts: 'allure-report.tar.gz', fingerprint: true
        }
    }
}
