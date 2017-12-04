#!/bin/bash
cd rn/crm;
react-native bundle --platform android --dev false --entry-file index.android.js \
	--bundle-output ../../CainiaoCRM/src/main/assets/index.android.bundle \
	--sourcemap-output ../../CainiaoCRM/src/main/assets/index.android.map \
	--assets-dest ../../CainiaoCRM/src/main/res/
cd -;
