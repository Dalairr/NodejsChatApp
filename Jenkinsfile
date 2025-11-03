node {
  // ---------- Settings ----------
  def DOCKERHUB_REPO = "dalairr/nodejs-chat-app"   // your Docker Hub repo
  def IMAGE_TAG      = "build-${env.BUILD_NUMBER}"
  def APP_PORT       = "3000"
  def APP_HOST       = "173.230.133.23"            // Linode IP
  def APP_USER       = "root"                      // Linode default SSH user

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
            docker run -d --name chatapp -p ${APP_PORT}:${APP_PORT} -e PORT=${APP_PORT} ${DOCKERHUB_REPO}:latest &&
            docker logout || true
          '
        """
      }
    }
  }
}
