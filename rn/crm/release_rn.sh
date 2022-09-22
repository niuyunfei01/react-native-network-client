#!/bin/bash


npx react-native bundle --platform android --dev false --entry-file index.js \
	--bundle-output android/app/src/main/assets/index.android.bundle \
	--assets-dest android/app/src/main/res/

./node_modules/hermes-engine/osx-bin/hermesc -O -emit-binary \
  -out android/app/src/main/assets/index.android.bundle.hbc \
  -output-source-map android/app/src/main/assets/index.android.bundle

rm -rf android/app/src/main/assets/index.android.bundle

mv android/app/src/main/assets/index.android.bundle.hbc android/app/src/main/assets/index.android.bundle

rm -rf android/app/src/main/assets/index.android.bundle.hbc.map


cd ..;
