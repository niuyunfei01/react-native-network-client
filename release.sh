echo "build react native scripts...."

export BABEL_ENV=production

./release_rn.sh

echo "build android apk..."
./gradlew clean assembleRelease

export BABEL_ENV=dev

