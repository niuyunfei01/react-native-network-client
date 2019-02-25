#!/bin/bash

export BABEL_ENV=dev

cd rn/crm;

react-native bundle --platform android --dev false --entry-file index.js \
	--bundle-output ../../CainiaoCRM/src/main/assets/index.android.bundle \
	--sourcemap-output ../../CainiaoCRM/src/main/assets/index.android.map \
	--assets-dest ../../CainiaoCRM/src/main/res/

cd -;
