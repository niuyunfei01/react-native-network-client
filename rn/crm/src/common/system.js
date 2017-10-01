/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan  
 * @flow
 */

// System
import { Platform, ErrorUtils } from 'react-native'
import stacktraceParser from 'stacktrace-parser';

export default {
    isIOS: Platform.OS === 'ios',
}