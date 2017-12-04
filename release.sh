echo "build react native scripts...."

./release_rn.sh

echo "build android apk..."
./gradlew clean assembleRelease

