#!/usr/bin/env bash
# Builds one Agent's Android APK: a Trusted Web Activity (a ~1-2 MB shell that
# opens the live site full-screen) whose start URL is /join/<agent invite code>,
# so that Agent's players land on a Register screen that texts that Agent's
# WhatsApp. One APK per Agent; the web app itself updates with every deploy and
# the APK rarely needs rebuilding (only a new Agent, icon, name or domain).
#
#   scripts/build-agent-apk.sh <agentInviteCode>   ->  public/apk/<code>.apk
#
# One-time setup lives outside the repos (never commit any of it):
#   ~/.predictsim-apk        npm install @bubblewrap/cli
#   ~/.bubblewrap            JDK 17 + Android SDK, config.json pointing at them
#   ~/.predictsim-keystore   predictsim.jks + 'password' (chmod 600). BACK THESE
#                            UP: lose the key and installed apps can't be
#                            updated in place, only reinstalled.
set -euo pipefail

CODE="${1:?usage: build-agent-apk.sh <agentInviteCode>}"
[[ "$CODE" =~ ^[A-Za-z0-9_-]{4,32}$ ]] || { echo "invalid invite code: $CODE" >&2; exit 1; }

HOST="${APK_HOST:-player-alpha-rosy.vercel.app}"
PACKAGE="${APK_PACKAGE:-app.predictsim.player}"
KEYSTORE="${APK_KEYSTORE:-$HOME/.predictsim-keystore/predictsim.jks}"
KEY_ALIAS="${APK_KEY_ALIAS:-predictsim}"
PASS_FILE="${APK_KEYSTORE_PASS_FILE:-$HOME/.predictsim-keystore/password}"
BW="${APK_BUBBLEWRAP:-$HOME/.predictsim-apk/node_modules/.bin/bubblewrap}"
VERSION_CODE="${APK_VERSION_CODE:-1}"

for f in "$KEYSTORE" "$PASS_FILE" "$BW"; do [ -e "$f" ] || { echo "missing: $f (see header)" >&2; exit 1; }; done

REPO="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
cd "$WORK"

cat > twa-manifest.json <<JSON
{
  "packageId": "$PACKAGE",
  "host": "$HOST",
  "name": "PredictSim Player",
  "launcherName": "PredictSim",
  "display": "standalone",
  "orientation": "portrait",
  "themeColor": "#059669",
  "themeColorDark": "#059669",
  "navigationColor": "#ffffff",
  "navigationColorDark": "#000000",
  "navigationDividerColor": "#ffffff",
  "navigationDividerColorDark": "#000000",
  "backgroundColor": "#f7f8fa",
  "enableNotifications": false,
  "startUrl": "/join/$CODE",
  "iconUrl": "https://$HOST/icon-512.png",
  "maskableIconUrl": "https://$HOST/icon-maskable-512.png",
  "webManifestUrl": "https://$HOST/manifest.webmanifest",
  "fullScopeUrl": "https://$HOST/",
  "splashScreenFadeOutDuration": 300,
  "signingKey": { "path": "$KEYSTORE", "alias": "$KEY_ALIAS" },
  "appVersionName": "$VERSION_CODE",
  "appVersionCode": $VERSION_CODE,
  "fallbackType": "customtabs",
  "minSdkVersion": 24,
  "shortcuts": [],
  "features": {},
  "alphaDependencies": { "enabled": false },
  "enableSiteSettingsShortcut": false,
  "isChromeOSOnly": false,
  "isMetaQuest": false,
  "additionalTrustedOrigins": [],
  "retainedBundles": [],
  "fingerprints": [],
  "generatorApp": "bubblewrap-cli"
}
JSON

export BUBBLEWRAP_KEYSTORE_PASSWORD="$(cat "$PASS_FILE")"
export BUBBLEWRAP_KEY_PASSWORD="$BUBBLEWRAP_KEYSTORE_PASSWORD"

"$BW" update --skipVersionUpgrade --manifest=./twa-manifest.json
"$BW" build --skipPwaValidation --manifest=./twa-manifest.json

mkdir -p "$REPO/public/apk"
cp app-release-signed.apk "$REPO/public/apk/$CODE.apk"
echo "built public/apk/$CODE.apk ($(du -h "$REPO/public/apk/$CODE.apk" | cut -f1))"
