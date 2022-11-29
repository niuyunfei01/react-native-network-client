import Sound from "react-native-sound";

Sound.setCategory('Playback', true);
 Sound.setActive(true)

let order_sound = null
let music_error = null
const music_url = 'http://music.ruoyi.vip/wanyouyinli'
export const initMusic = () => {
  order_sound = new Sound(music_url, null, error => music_error = error)

}

export const play = (callback = () => {
}) => {
  if (music_error)
    return
  if (order_sound) {
    order_sound.setNumberOfLoops(-1);
    order_sound.play(() => callback())
  }
}
export const pause = (callback = () => {
}) => {
  if (music_error)
    return
  if (order_sound)
    order_sound.pause(() => callback())
}

export const getMusicStatus = () => {
  if (music_error)
    return false
  if (order_sound)
    return order_sound.isPlaying()
}

export const unInitMusic = () => {
  if (music_error)
    return
  if (order_sound) {
    order_sound.stop()
    order_sound.release()
  }
}
