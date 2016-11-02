#!/bin/bash

npm run build

BABEL_OPTS='--presets=babili --no-comments'
BABEL_COMMAND="./node_modules/babel-cli/bin/babel.js"
FILES=$(find dist/*.js build/*.js ! -name "*.min.*")

for file in $FILES; do
	DIR=$(dirname $file)
	BASENAME=$(basename $file '.js')
	OUTPUT_FILE="$DIR/$BASENAME.min.js"
	$BABEL_COMMAND "$file" --out-file "$OUTPUT_FILE" $BABEL_OPTS
done
