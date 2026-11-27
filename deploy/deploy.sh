#!/usr/bin/env bash
# Production deployment, run on the VPS as the `deploy` user.
# Triggered by the GitHub Actions `deploy` job through SSH: the deploy key is restricted in
# authorized_keys with command="/opt/glou/deploy/deploy.sh", so it can only run this script.
# Can also be run by hand: /opt/glou/deploy/deploy.sh

# Everything is inside main(), called on the last line: `git pull` may rewrite this file
# while it runs, and bash has then already read the whole function.
main() {
  set -euo pipefail

  local repo_dir
  repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  cd "$repo_dir"

  # One deployment at a time
  exec 9>/tmp/glou-deploy.lock
  if ! flock -n 9; then
    echo "Another deployment is already running" >&2
    exit 1
  fi

  echo "==> Updating code ($(git rev-parse --short HEAD))"
  # Refuses to deploy if the server copy has diverged from main
  git pull --ff-only
  echo "==> Now at $(git log -1 --format='%h %s')"

  echo "==> Building and starting containers"
  # --wait: fails if a service does not become healthy, so a broken deployment fails the job
  docker compose -f docker-compose.prod.yml up -d --build --remove-orphans --wait --wait-timeout 180

  echo "==> Removing unused images"
  docker image prune -f

  docker compose -f docker-compose.prod.yml ps
  echo "==> Deployment done"
}

main "$@"; exit
