import {Dimensions, DeviceInfo, Platform} from 'react-native';

// 58 app 只有竖屏模式，所以可以只获取一次 width
const deviceWidthDp = Dimensions.get('window').width;
// UI 默认给图是 720
const uiWidthPx = 720;
//为了适应系统的响应式字体

let fontScale = 1;
if(Platform.OS !== "ios"){
     fontScale = DeviceInfo.Dimensions.screenPhysicalPixels.fontScale;

}

function pxToEm(uiElementPx) {
    return uiElementPx * deviceWidthDp / uiWidthPx/fontScale;
}


//安卓手机系统 字体设置为最大时 fontScale 为1.3    标准字体为 fontScale 为 1




export default pxToEm
