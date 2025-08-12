pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "dinesh571/playwright-k8:latest"
        KUBECONFIG_PATH = "/var/jenkins_home/.kube/config"
    }

    stages {

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE'
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    docker push $DOCKER_IMAGE
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes Job') {
            steps {
                sh '''
                kubectl --kubeconfig=$KUBECONFIG_PATH delete job my-job --ignore-not-found
                cat <<EOF | kubectl --kubeconfig=$KUBECONFIG_PATH apply -f -
                apiVersion: batch/v1
                kind: Job
                metadata:
                  name: my-job
                spec:
                  template:
                    spec:
                      containers:
                      - name: my-container
                        image: $DOCKER_IMAGE
                      restartPolicy: Never
                EOF
                '''
            }
        }
    }
}
