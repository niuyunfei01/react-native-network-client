import TrackPlayer, { RepeatMode } from 'react-native-track-player';


export const QueueInitialTracksService = async (): Promise<void> => {
    await TrackPlayer.add([

        {
            url: 'https://freepd.com/music/Beat%20Thee.mp3',
            title: 'Beat Thee',
            artist: 'Alexander Nakarada',
            duration: 28,
        },
    ]);
    await TrackPlayer.setRepeatMode(RepeatMode.Queue);
};
