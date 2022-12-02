import TrackPlayer, { RepeatMode } from 'react-native-track-player';


export const QueueInitialTracksService = async (): Promise<void> => {
    await TrackPlayer.add([

        {
            url: 'http://music.ruoyi.vip/wanyouyinli',
            title: '万有引力',
            artist: 'Fyy',
            artwork:'http://p1.music.126.net/PzVklWfH2G1gVuHd3a50Gg==/109951164984873532.jpg',
            duration: 28,
        },
    ]);
    await TrackPlayer.setRepeatMode(RepeatMode.Queue);
};
