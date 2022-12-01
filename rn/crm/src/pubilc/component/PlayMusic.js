import React from "react";
import {StyleSheet, Text, TouchableOpacity} from "react-native";
import colors from "../styles/colors";
import TrackPlayer, {State, usePlaybackState} from "react-native-track-player";

export const PlayMusicComponent = () => {

  const playerState = usePlaybackState();
  const isPlaying = playerState === State.Playing;
  const playOrStopMusic = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
      return
    }
    await TrackPlayer.play();
  }

  return (
    <TouchableOpacity style={styles.item_row} onPress={playOrStopMusic}>
      <Text style={styles.row_label}>播放状态 </Text>
      <Text style={styles.row_footer}>{isPlaying ? '正在播放 ' : '未播放 '}</Text>
    </TouchableOpacity>
  )
}
const styles = StyleSheet.create({
  item_row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderColor: colors.f5,
    borderBottomWidth: 0.5,
  },
  row_label: {
    fontSize: 14,
    color: colors.color333,
    flex: 1,
  },
  row_label_desc: {
    fontSize: 12,
    color: colors.color999,
    marginTop: 2,
  },
})
