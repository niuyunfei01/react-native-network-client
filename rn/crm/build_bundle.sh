#!/bin/bash
this_dir=`pwd`
echo 'build android'
npx react-native bundle --platform android --dev false --entry-file index.js \
  --bundle-output last/android-bundle/$1.android.bundle \
  --assets-dest last/android-bundle

./node_modules/hermes-engine/osx-bin/hermesc -O -emit-binary \
  -out last/android-bundle/$1.android.bundle.hbc \
  -output-source-map last/android-bundle/$1.android.bundle

rm -rf last/android-bundle/$1.android.bundle
mv last/android-bundle/$1.android.bundle.hbc last/android-bundle/$1.android.bundle
rm -rf last/android-bundle/$1.android.bundle.hbc.map

echo 'build ios'
npx react-native bundle --platform ios --dev false --entry-file index.ios.js  \
 --bundle-output last/ios-bundle/$1.ios.bundle  \
 --assets-dest last/ios-bundle
echo 'bundle_zip'
cd $this_dir/last/ios-bundle || exit
zip -r $1.ios.zip ./
mv $1.ios.zip  ../
rm -rf *
cd $this_dir/last/android-bundle/ || exit
zip -r $1.android.zip ./
mv $1.android.zip  ../
rm -rf *
cd $this_dir || exit
echo 'build success';
