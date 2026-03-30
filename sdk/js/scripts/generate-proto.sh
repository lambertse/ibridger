#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SDK_JS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROTO_ROOT="$(cd "$SDK_JS_DIR/../../proto" && pwd)"
OUT_DIR="$SDK_JS_DIR/src/generated"

mkdir -p "$OUT_DIR"

PROTO_FILES=(
  "$PROTO_ROOT/ibridger/envelope.proto"
  "$PROTO_ROOT/ibridger/rpc.proto"
  "$PROTO_ROOT/ibridger/constants.proto"
  "$PROTO_ROOT/ibridger/examples/echo.proto"
)

echo "Generating JS/TS from protos..."

# Static JS module + TypeScript definitions via protobufjs-cli
npx pbjs \
  --target static-module \
  --wrapper commonjs \
  --force-long \
  --path "$PROTO_ROOT" \
  "${PROTO_FILES[@]}" \
  --out "$OUT_DIR/proto.js"

npx pbts \
  --out "$OUT_DIR/proto.d.ts" \
  "$OUT_DIR/proto.js"

echo "Done. Output: $OUT_DIR/proto.js  $OUT_DIR/proto.d.ts"
