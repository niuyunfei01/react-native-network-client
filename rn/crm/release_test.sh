echo "build react native scripts...."

export BABEL_ENV=production

./release_rn.sh

cd ./android

./gradlew clean

echo "build android apk..."
./gradlew assembleRelease

export BABEL_ENV=dev

