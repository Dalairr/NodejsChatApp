node {
  // ---------- Settings ----------
  def DOCKERHUB_REPO = "dalairf/nodejs-chat-app"
  def IMAGE_TAG      = "build-${env.BUILD_NUMBER}"

  stage('Checkout (Clone GitHub)') {
    checkout scm
    sh 'git rev-parse --short HEAD'
  }

  stage('Build image & Tag') {
    sh """
      set -eux
      docker build -t ${DOCKERHUB_REPO}:${IMAGE_TAG} -t ${DOCKERHUB_REPO}:latest .
      docker images | head -n 5
    """
  }

  stage('Push to Docker Hub') {
    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
      usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
      sh """
        set -eux
        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
        docker push ${DOCKERHUB_REPO}:${IMAGE_TAG}
        docker push ${DOCKERHUB_REPO}:latest
        docker logout
      """
    }
  }

  stage('Pull & Run (Local Deploy)') {
    sh """
      set -eux
      docker rm -f chatapp 2>/dev/null || true
      docker pull docker.io/${DOCKERHUB_REPO}:latest
      docker run -d --name chatapp \\
        -p 80:3700 \\
        -e NODE_ENV=production \\
        -e PORT=3700 \\
        --restart unless-stopped \\
        docker.io/${DOCKERHUB_REPO}:latest
      docker ps --format "table {{.Names}}\\t{{.Image}}\\t{{.Ports}}\\t{{.Status}}"
    """
  }

  stage('Verify (public)') {
    sh """
      set -eu
      echo "Waiting for http://173.230.133.23:80/ ..."
      for i in {1..15}; do
        if curl -fsS http://173.230.133.23:80/ > /dev/null; then
          echo "✅ App is live!"
          exit 0
        fi
        sleep 2
      done
      echo "❌ App did not become healthy in time"
      docker logs --tail=200 chatapp || true
      exit 1
    """
  }
}
