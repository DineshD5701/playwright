pipeline {
  agent any
  environment {
    DOCKER_IMAGE = "dinesh571/playwright-tests:latest"
    TOTAL_SHARDS = 4
    // Pull kubeconfig secret from Jenkins credentials
    KUBECONFIG_B64 = credentials('MINIKUBE_KUBECONFIG_B64')
  }
  stages {
    stage('Setup Kubeconfig') {
      steps {
        sh '''
          echo "$KUBECONFIG_B64" | base64 -d > kubeconfig
          export KUBECONFIG=$(pwd)/kubeconfig
          kubectl cluster-info
        '''
      }
    }
    stage('Build & Push Docker Image') {
      steps {
        sh 'docker build -t $DOCKER_IMAGE .'
        sh 'docker push $DOCKER_IMAGE'
      }
    }
    stage('Run Playwright Shards in K8s') {
      steps {
        sh '''
          export KUBECONFIG=$(pwd)/kubeconfig
          kubectl apply -f k8s/allure-pvc.yml
        '''
        script {
          for (int i = 1; i <= TOTAL_SHARDS.toInteger(); i++) {
            sh """
              export KUBECONFIG=$(pwd)/kubeconfig
              sed "s/{{SHARD_ID}}/$i/g; s/{{TOTAL_SHARDS}}/$TOTAL_SHARDS/g" \
              k8s/playwright-job.yml | kubectl apply -f -
            """
          }
        }
      }
    }
    stage('Wait for Jobs to Finish') {
      steps {
        sh '''
          export KUBECONFIG=$(pwd)/kubeconfig
          kubectl wait --for=condition=complete job --all --timeout=900s
        '''
      }
    }
    stage('Generate Allure Report') {
        steps {
            sh '''
            export KUBECONFIG=$(pwd)/kubeconfig
            POD_NAME=$(kubectl get pod -l job-name=playwright-test-1 -o jsonpath="{.items[0].metadata.name}")
            kubectl cp $POD_NAME:/app/allure-results allure-results
            allure generate allure-results --clean -o allure-report
            '''
            archiveArtifacts artifacts: 'allure-report/**', allowEmptyArchive: false
        }
      }
  }
}
