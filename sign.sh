#!/bin/bash
NAME=$1
jarsigner -verbose -keystore "$KEYSTORE" -signedjar "$NAME-signed.apk" "$NAME" "$KEY_ALIAS"
