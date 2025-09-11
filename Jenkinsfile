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

        stage('Notify GChat') {
            steps {
                withCredentials([string(credentialsId: 'GCHAT_WEBHOOK', variable: 'GCHAT_WEBHOOK')]) {
                    script {
                        def jobUrl = env.BUILD_URL
                        def allureReportUrl = "${jobUrl}allure"  // Jenkins Allure report URL
                        def status = currentBuild.currentResult  // SUCCESS / FAILURE / UNSTABLE

                        sh """
                        curl -X POST -H 'Content-Type: application/json' \
                        -d '{
                              "cards": [{
                                "header": {
                                  "title": "Playwright Pipeline",
                                  "subtitle": "Build #${env.BUILD_NUMBER} - ${status}"
                                },
                                "sections": [{
                                  "widgets": [{
                                    "buttons": [{
                                      "textButton": {
                                        "text": "View Allure Report",
                                        "onClick": {
                                          "openLink": {
                                            "url": "${allureReportUrl}"
                                          }
                                        }
                                      }
                                    }]
                                  }]
                                }]
                              }]
                            }' \
                        $GCHAT_WEBHOOK
                        """
                    }
                }
            }
        }

    }
}
