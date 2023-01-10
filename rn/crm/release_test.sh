echo "build react native scripts...."

export BABEL_ENV=production

./release_rn.sh

echo "build test android apk..."
fastlane android beta

echo "build test ios apk..."
fastlane ios beta

git add .
git commit -m "bundle && update ios version"
git push
export BABEL_ENV=dev

