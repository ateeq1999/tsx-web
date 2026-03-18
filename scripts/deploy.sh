#!/usr/bin/env bash
set -e

# Usage:
#   ./scripts/deploy.sh registry-web [--prod]
#   ./scripts/deploy.sh docs [--prod]
#   ./scripts/deploy.sh all [--prod]

APP=$1
PROD_FLAG=""
if [[ "$2" == "--prod" ]]; then
  PROD_FLAG="--prod"
fi

ORG_ID="team_ZXYg3N40sVxlvjK3XxEdk21M"
declare -A PROJECT_IDS=(
  [registry-web]="prj_TuuSlGG2eGWFpgyr8QeYWd0zm2vj"
  [docs]="prj_aCHwTqnPA0dNj8qkYzjaDgCYB4tc"
)

deploy_app() {
  local app=$1
  echo "==> Deploying $app..."
  VERCEL_ORG_ID="$ORG_ID" \
  VERCEL_PROJECT_ID="${PROJECT_IDS[$app]}" \
  vercel deploy . \
    --local-config "apps/$app/vercel.json" \
    --scope ateeq1999s-projects \
    $PROD_FLAG \
    --yes
}

case "$APP" in
  registry-web | docs)
    deploy_app "$APP"
    ;;
  all)
    deploy_app registry-web
    deploy_app docs
    ;;
  *)
    echo "Usage: $0 <registry-web|docs|all> [--prod]"
    exit 1
    ;;
esac
