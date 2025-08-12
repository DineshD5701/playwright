pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "dinesh571/playwright-k8"
        IMAGE_TAG = "latest-${BUILD_NUMBER}"
        KUBECONFIG_PATH = "/var/jenkins_home/.kube/config"
    }

    stages {

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE:$IMAGE_TAG .'
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    docker push $DOCKER_IMAGE:$IMAGE_TAG
                    '''
                }
            }
        }

    stage('Deploy to Kubernetes Job') {
    steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
            sh '''#!/bin/bash
                set -e
                kubectl --kubeconfig="$KUBECONFIG_FILE" delete job my-job --ignore-not-found

                kubectl --kubeconfig="$KUBECONFIG_FILE" apply -f - <<'EOF'
apiVersion: batch/v1
kind: Job
metadata:
  name: my-job
spec:
  template:
    spec:
      containers:
      - name: my-container
        image: '"'"$DOCKER_IMAGE:$IMAGE_TAG"'"'
      restartPolicy: Never
EOF
            '''
        }
    }
}

    }

}
