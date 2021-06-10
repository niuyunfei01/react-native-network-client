
// System
import { Platform, ErrorUtils } from 'react-native'
import stacktraceParser from 'stacktrace-parser';

export default {
    isIOS: Platform.OS === 'ios',
}