import Sound from 'react-native-sound';

Sound.setCategory('Playback');

function setComponentState(audioInfo, component, status) {
  component.setState({audios: {...component.state.audios, [audioInfo.title]: status}});
}

/**
 * Generic play function
 */
export default function playSound(audioInfo, component) {
  setComponentState(audioInfo, component, 'pending');
  const callback = (error, sound) => {
    if (error) {
      setComponentState(audioInfo, component, 'fail');
      return;
    }
    setComponentState(audioInfo, component, 'playing');
    // Run optional pre-play callback
    audioInfo.onPrepared && audioInfo.onPrepared(sound, component);
    sound.play(() => {
      // Success counts as getting to the end
      setComponentState(audioInfo, component, 'win');
      // Release when it's done so we're not using up resources
      sound.release();
    });
  };
  // If the audio is a 'require' then the second parameter must be the callback.
  let sound = undefined;
  if (audioInfo.isRequire) {
    sound = new Sound(audioInfo.url, error => callback(error, sound));
  } else {
    sound = new Sound(audioInfo.url, audioInfo.basePath, error => callback(error, sound));
  }
  return sound;
}
