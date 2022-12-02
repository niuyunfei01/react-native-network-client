import TrackPlayer, {Event, State} from 'react-native-track-player';

let wasPausedByDuck = false;

export async function PlaybackService() {
    TrackPlayer.addEventListener(Event.RemotePause, async () => {

        await TrackPlayer.pause();
    });

    TrackPlayer.addEventListener(Event.RemotePlay, async () => {

        await TrackPlayer.play();
    });

    TrackPlayer.addEventListener(Event.RemoteNext, async () => {

        await TrackPlayer.skipToNext();
    });

    TrackPlayer.addEventListener(Event.RemotePrevious, async () => {

        await TrackPlayer.skipToPrevious();
    });

    TrackPlayer.addEventListener(Event.RemoteJumpForward, async (event) => {

        const position = (await TrackPlayer.getPosition()) + event.interval;
        await TrackPlayer.seekTo(position);
    });

    TrackPlayer.addEventListener(Event.RemoteJumpBackward, async (event) => {

        const position = (await TrackPlayer.getPosition()) - event.interval;
        await TrackPlayer.seekTo(position);
    });

    TrackPlayer.addEventListener(Event.RemoteSeek, async (event) => {

        await TrackPlayer.seekTo(event.position);
    });

    TrackPlayer.addEventListener(
        Event.RemoteDuck,
        async ({permanent, paused}) => {

            if (permanent) {
                await TrackPlayer.pause();
                return;
            }
            if (paused) {
                const playerState = await TrackPlayer.getState();
                wasPausedByDuck = playerState !== State.Paused;
                await TrackPlayer.pause();
            } else {
                if (wasPausedByDuck) {
                    await TrackPlayer.play();
                    wasPausedByDuck = false;
                }
            }
        }
    );

    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, (event) => {
        // console.log('Event.PlaybackQueueEnded', event);
    });

    TrackPlayer.addEventListener(Event.PlaybackTrackChanged, (event) => {
        // console.log('Event.PlaybackTrackChanged', event);
    });

    TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, (event) => {
        // console.log('Event.PlaybackProgressUpdated', event);
    });
}
