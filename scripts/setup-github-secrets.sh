#!/usr/bin/env bash
# Sets GitHub Actions secrets required for Vercel deployments.
# Usage: GITHUB_TOKEN=<token> ./scripts/setup-github-secrets.sh
#
# Get a GitHub token at: https://github.com/settings/tokens
# Required scopes: repo (for private repos) or public_repo (for public repos)

set -e

REPO="ateeq1999/tsx-web"

: "${GITHUB_TOKEN:?Set GITHUB_TOKEN before running this script}"
: "${VERCEL_TOKEN:?Set VERCEL_TOKEN before running this script (create at vercel.com/account/tokens)}"

set_secret() {
  local name=$1
  local value=$2

  # Fetch the repo's public key for secret encryption
  KEY_DATA=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$REPO/actions/secrets/public-key")
  KEY_ID=$(echo "$KEY_DATA" | grep -o '"key_id":"[^"]*"' | cut -d'"' -f4)
  KEY=$(echo "$KEY_DATA" | grep -o '"key":"[^"]*"' | cut -d'"' -f4)

  # Encrypt the secret value using libsodium (requires python3 + PyNaCl)
  ENCRYPTED=$(python3 - <<EOF
import base64
from nacl import encoding, public

def encrypt(public_key: str, secret_value: str) -> str:
    pk = public.PublicKey(public_key.encode("utf-8"), encoding.Base64Encoder())
    sealed_box = public.SealedBox(pk)
    encrypted = sealed_box.encrypt(secret_value.encode("utf-8"))
    return base64.b64encode(encrypted).decode("utf-8")

print(encrypt("$KEY", "$value"))
EOF
)

  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X PUT \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Content-Type: application/json" \
    "https://api.github.com/repos/$REPO/actions/secrets/$name" \
    -d "{\"encrypted_value\":\"$ENCRYPTED\",\"key_id\":\"$KEY_ID\"}")

  if [[ "$HTTP_STATUS" == "201" || "$HTTP_STATUS" == "204" ]]; then
    echo "✓ Set secret: $name"
  else
    echo "✗ Failed to set secret: $name (HTTP $HTTP_STATUS)"
    exit 1
  fi
}

set_secret "VERCEL_TOKEN"                  "$VERCEL_TOKEN"
set_secret "VERCEL_ORG_ID"                 "team_ZXYg3N40sVxlvjK3XxEdk21M"
set_secret "VERCEL_REGISTRY_WEB_PROJECT_ID" "prj_TuuSlGG2eGWFpgyr8QeYWd0zm2vj"
set_secret "VERCEL_DOCS_PROJECT_ID"        "prj_aCHwTqnPA0dNj8qkYzjaDgCYB4tc"

echo ""
echo "All secrets set. Remaining manual steps:"
echo "  1. Set DATABASE_URL on registry-web:"
echo "     vercel env add DATABASE_URL production --cwd apps/registry-web"
echo "  2. Set BETTER_AUTH_SECRET on registry-web:"
echo "     vercel env add BETTER_AUTH_SECRET production --cwd apps/registry-web"
echo "  3. Set BETTER_AUTH_URL on registry-web:"
echo "     vercel env add BETTER_AUTH_URL production --cwd apps/registry-web"
