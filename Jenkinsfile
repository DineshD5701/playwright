pipeline {
  agent any
  environment {
    DOCKER_IMAGE = "dinesh571/playwright-tests:latest"
    TOTAL_SHARDS = 4
  }
  stages {
    stage('Build & Push Docker Image') {
      steps {
        sh 'docker build -t $DOCKER_IMAGE .'
        sh 'docker push $DOCKER_IMAGE'
      }
    }
    stage('Run Playwright Shards in K8s') {
      steps {
        sh 'kubectl apply -f k8s/allure-pvc.yml'
        script {
          for (int i = 1; i <= TOTAL_SHARDS.toInteger(); i++) {
            sh """
              sed "s/{{SHARD_ID}}/$i/g; s/{{TOTAL_SHARDS}}/$TOTAL_SHARDS/g" \
              k8s/playwright-job.yml | kubectl apply -f -
            """
          }
        }
      }
    }
    stage('Wait for Jobs to Finish') {
      steps {
        sh 'kubectl wait --for=condition=complete job --all --timeout=900s'
      }
    }
    stage('Generate Allure Report') {
      steps {
        // Copy results from PVC to Jenkins workspace
        sh 'kubectl cp $(kubectl get pod -l job-name=playwright-test-1 -o jsonpath="{.items[0].metadata.name}"):/app/allure-results allure-results'
        sh 'allure generate allure-results --clean -o allure-report'
        archiveArtifacts artifacts: 'allure-report/**', allowEmptyArchive: false
      }
    }
  }
}
