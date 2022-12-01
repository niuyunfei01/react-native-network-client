import TrackPlayer, {Event, State} from 'react-native-track-player';
import type {ProgressUpdateEvent} from 'react-native-track-player';

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

    TrackPlayer.addEventListener(Event.RemoteDuck, async e => {
        if (e.permanent === true) {
            await TrackPlayer.stop();
        } else {
            if (e.paused === true) {
                const playerState = await TrackPlayer.getState();
                wasPausedByDuck = playerState !== State.Paused;
                await TrackPlayer.pause();
            } else {
                if (wasPausedByDuck === true) {
                    await TrackPlayer.play();
                    wasPausedByDuck = false;
                }
            }
        }
    });

    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, data => {
        console.log('Event.PlaybackQueueEnded', data);
    });

    TrackPlayer.addEventListener(Event.PlaybackTrackChanged, data => {
        console.log('Event.PlaybackTrackChanged', data);
    });

    TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, (data: ProgressUpdateEvent) => {
            console.log('Event.PlaybackProgressUpdated', data);
        },
    );
}
