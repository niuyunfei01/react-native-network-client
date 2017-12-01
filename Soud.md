###定义数据格式
在res/raw 下面的文件
let soud = {
    title: 'mp3 in bundle',
    url: 'advertising.mp3',
    basePath: Sound.MAIN_BUNDLE,
}
或者
网络文件
let soud = {
    title: 'mp3 remote download',
    url: 'https://raw.githubusercontent.com/zmxv/react-native-sound-demo/master/advertising.mp3',
}


###调用服务
import PlaySound from './util/playSound'


componentDidMount() {
  let sound = PlaySound(audioInfo, this);
  sound.play();
}

###相关配置
let sound = PlaySound(audioInfo, this);
// Reduce the volume by half
sound.setVolume(0.5);

// Position the sound to the full right in a stereo field
sound.setPan(1);

// Loop indefinitely until stop() is called
sound.setNumberOfLoops(-1);

// Seek to a specific point in seconds
sound.setCurrentTime(2.5);

// Get the current playback point in seconds
sound.getCurrentTime((seconds) => console.log('at ' + seconds));

// Pause the sound
sound.pause();

// Stop the sound and rewind to the beginning
sound.stop(() => {
  // Note: If you want to play a sound after stopping and rewinding it,
  // it is important to call play() in a callback.
  whoosh.play();
});



