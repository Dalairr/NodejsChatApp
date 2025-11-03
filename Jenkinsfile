node {
  // ---------- Settings ----------
  def DOCKERHUB_REPO = "dalairf/nodejs-chat-app"    // unified name
  def IMAGE_TAG      = "build-${env.BUILD_NUMBER}"
  def APP_PORT       = "3700"                        // app listens on 3700
  def APP_HOST       = "173.230.133.23"             // Linode IP
  def APP_USER       = "root"                       // SSH user

  stage('Checkout (Clone GitHub)') {
    checkout scm
    sh 'git rev-parse --short HEAD'
  }

  stage('Build image & Tag') {
    sh """
      docker build -t ${DOCKERHUB_REPO}:${IMAGE_TAG} -t ${DOCKERHUB_REPO}:latest .
      docker images | head -n 5
    """
  }

  stage('Push to Docker Hub') {
    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
      usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
      sh """
        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
        docker push ${DOCKERHUB_REPO}:${IMAGE_TAG}
        docker push ${DOCKERHUB_REPO}:latest
        docker logout || true
      """
    }
  }

  stage('Pull & Run the App (remote Linode)') {
    sshagent(credentials: ['deploy-ssh-key']) {
      withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
        usernameVariable: 'DHU', passwordVariable: 'DHP')]) {
        sh """
          ssh -o StrictHostKeyChecking=no ${APP_USER}@${APP_HOST} '
            echo "${DHP}" | docker login -u "${DHU}" --password-stdin &&
            docker pull ${DOCKERHUB_REPO}:latest &&
            docker rm -f chatapp || true &&
            docker run -d --name chatapp \\
              -p ${APP_PORT}:${APP_PORT} \\
              -e NODE_ENV=production \\
              -e PORT=${APP_PORT} \\
              ${DOCKERHUB_REPO}:latest &&
            docker logout || true
          '
        """
      }
    }
  }

  stage('Verify (remote)') {
    sh "curl -sSf http://${APP_HOST}:${APP_PORT}/ | head -c 200 || true"
  }
}
