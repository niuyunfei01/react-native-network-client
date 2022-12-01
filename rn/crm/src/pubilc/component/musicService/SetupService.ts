import TrackPlayer, {Capability} from 'react-native-track-player';

export const SetupService = async (): Promise<boolean> => {

    try {
        // this method will only reject if player has not been setup yet
        await TrackPlayer.getCurrentTrack();
        return true;
    } catch {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
            stopWithApp: false,
            capabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
                Capability.SkipToPrevious,
                Capability.Stop,
            ],
            compactCapabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
            ],
            progressUpdateEventInterval: 2,
        });

        return true;
    }
};
