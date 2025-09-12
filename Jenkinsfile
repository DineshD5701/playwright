pipeline {
    agent any

    environment {
        NAMESPACE = "default"
        TOTAL_SHARDS = 4
        KUBECONFIG_CONTENT = credentials('KUBECONFIG_CONTENT')
        DOCKER_IMAGE = "dinesh571/playwright:latest"
        PVC_NAME = "allure-pvc"
        REPORT_URL = "https://7503742845ed.ngrok-free.app/job/${JOB_NAME}/${BUILD_NUMBER}/allure"
    }

    stages {

        stage('Build & Push Docker Image') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh """
                          echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                          docker build -t $DOCKER_IMAGE .
                          docker push $DOCKER_IMAGE
                        """
                    }
                }
            }
        }

        stage('Run Tests on Kubernetes') {
            steps {
                script {
                    withCredentials([file(credentialsId: 'KUBECONFIG_CONTENT', variable: 'KUBECONFIG_FILE')]) {
                        sh """
                          export KUBECONFIG=$KUBECONFIG_FILE
                          kubectl apply -f k8s/playwright-job.yml -n $NAMESPACE
                          kubectl wait --for=condition=complete job/playwright-tests -n $NAMESPACE --timeout=600s
                        """
                    }
                }
            }
        }

        stage('Generate Allure Report') {
            steps {
                script {
                    sh """
                      mkdir -p allure-results
                      kubectl cp $NAMESPACE/\$(kubectl get pods -n $NAMESPACE | grep allure | awk '{print \$1}'):/app/allure-results ./allure-results -n $NAMESPACE
                      allure generate allure-results --clean -o allure-report
                    """
                }
            }
        }

        stage('Publish to GitHub Pages') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'github-token', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                        sh """
                          git config --global user.email "ci-bot@example.com"
                          git config --global user.name "CI Bot"
                          rm -rf gh-pages
                          git clone https://${GIT_USER}:${GIT_PASS}@github.com/<your-username>/<your-repo>.git -b gh-pages gh-pages
                          rm -rf gh-pages/*
                          cp -r allure-report/* gh-pages/
                          cd gh-pages
                          git add .
                          git commit -m "Update Allure Report for Build #${BUILD_NUMBER}"
                          git push origin gh-pages
                        """
                    }
                }
            }
        }

	stage('Notify Google Chat') {
	    steps {
		withCredentials([string(credentialsId: 'GCHAT_WEBHOOK', variable: 'GCHAT_WEBHOOK')]) {
		    script {
		        // Extract test summary safely (fallback to 0 if missing)
		        def total = sh(script: "grep -o '\"total\":[0-9]*' allure-report/widgets/summary.json | grep -o '[0-9]*' || echo 0", returnStdout: true).trim()
		        def failed = sh(script: "grep -o '\"failed\":[0-9]*' allure-report/widgets/summary.json | grep -o '[0-9]*' || echo 0", returnStdout: true).trim()
		        def broken = sh(script: "grep -o '\"broken\":[0-9]*' allure-report/widgets/summary.json | grep -o '[0-9]*' || echo 0", returnStdout: true).trim()
		        def skipped = sh(script: "grep -o '\"skipped\":[0-9]*' allure-report/widgets/summary.json | grep -o '[0-9]*' || echo 0", returnStdout: true).trim()
		        def passed = sh(script: "grep -o '\"passed\":[0-9]*' allure-report/widgets/summary.json | grep -o '[0-9]*' || echo 0", returnStdout: true).trim()

		        def reportUrl = "https://dineshd5701.github.io/playwright/" 
		        def status = currentBuild.currentResult

		        // Send notification to Google Chat
		        sh """
		        curl -X POST -H 'Content-Type: application/json' \
		        -d '{
		          "text": "🚀 *Playwright Test Suite Completed* 🚀\\n
		          🧪 *Total:* ${total}\\n
		          ✅ *Passed:* ${passed}\\n
		          ❌ *Failed:* ${failed}\\n
		          ⚠️ *Broken:* ${broken}\\n
		          ⏭️ *Skipped:* ${skipped}\\n
		          📊 *Status:* ${status}\\n
		          🔗 *Report:* ${reportUrl}"
		        }' \
		        $GCHAT_WEBHOOK
		        """
		        }
		    }
        }
	}
}
