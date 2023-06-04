import {Recording} from "expo-av/build/Audio/Recording";
import {StyleSheet, Text, View} from "react-native";
import {IconButton, ProgressBar} from "react-native-paper";
import {forwardRef, PropsWithChildren, useCallback, useEffect, useImperativeHandle, useState} from "react";
import {Audio, AVPlaybackStatusSuccess} from "expo-av";
import {RecordFile} from "../../types";

type AudioPlayerProps = {
    currentRecordFile: RecordFile
    recording?: Recording,
}

export type AudioPlayerRef = {
    reset: () => void
}

const AudioPlayer = forwardRef<AudioPlayerRef, PropsWithChildren<AudioPlayerProps>>(({
    currentRecordFile,
    recording = null,
    children
}, ref) => {
    const [sound, setSound] = useState<Audio.Sound>(null);
    const [progress, setProgress] = useState(0);

    /**
     * Jouer l'audio de l'uri donné
     */
    const play = useCallback(async () => {
        reset();
        const {sound} = await Audio.Sound.createAsync({uri: currentRecordFile.uri});
        setSound(sound);

        await sound.setProgressUpdateIntervalAsync(100);
        await sound.playAsync();

        sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatusSuccess) => {
            if (status.positionMillis && status.durationMillis)
                setProgress(status.positionMillis / status.durationMillis);
            else
                setProgress(0);
        });
    }, [currentRecordFile]);

    /**
     * Réinitialiser le composant
     */
    const reset = useCallback(() => {
        setSound(null);
        setProgress(0);
    }, []);

    /**
     * Décharger le son à la fermeture de l'application
     */
    useEffect(() => sound ? () => {
        sound.unloadAsync().then(() => null);
    } : undefined, [sound]);

    /**
     * Permet d'appeler la fonction reset depuis l'extérieur du composant
     */
    useImperativeHandle(ref, () => ({
        reset() {
            reset();
        }
    }));

    return (
        <View style={styles.audioPlayer}>
            <IconButton icon={"play"} mode={"contained"} size={32}
                        onPress={play}
                        disabled={!currentRecordFile?.uri}/>

            <View style={{flex: 1, flexDirection: "column"}}>
                <Text>{currentRecordFile?.name || "unnamed"} - {currentRecordFile?.origin}</Text>
                <ProgressBar progress={progress} style={styles.progressbar}/>
            </View>
            {children}
        </View>
    );
});

export default AudioPlayer;

const styles = StyleSheet.create({
    audioPlayer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginHorizontal: 20,
        borderTopColor: "#eee",
        borderTopWidth: 1
    },
    progressbar: {
        borderRadius: 5,
        marginRight: 7,
        marginTop: 5
    }
});