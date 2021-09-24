#!/bin/bash

export BABEL_ENV=dev

npx react-native bundle --platform android --dev false --entry-file index.js \
	--bundle-output android/app/src/main/assets/index.android.bundle \
	--assets-dest android/app/src/main/res/


npx react-native bundle --platform ios --dev false --entry-file index.ios.js \
	--bundle-output ios/main.jsbundle \
	--assets-dest ios

cd -;
