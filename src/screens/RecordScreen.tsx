import {SafeAreaView, StyleSheet, Text, View} from "react-native";
import {RootStackParamList} from "../../App";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {FC, useCallback, useEffect, useRef, useState} from "react";
import {ActivityIndicator, IconButton} from "react-native-paper";
import {Audio} from "expo-av";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import {RecordFile} from "../../types";
import AudioPlayer, {AudioPlayerRef} from "../components/audioPlayer";
import NamingPopUp, {NamingPopUpRef} from "../components/namingPopUp";
import {useDispatch, useSelector} from "react-redux";
import {audioSelector, setAudio} from "../stores/audioStore";
import {AUDIO_STORAGE, getAudios, IMPORT_STORAGE} from "../utils/audioUtils";
import AudioList from "../components/audioList";

type RecordScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, "Record">;
};

const RecordScreen: FC<RecordScreenProps> = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState<Audio.Recording>(null);
    const [audios, setAudios] = useState<RecordFile[]>([]);

    const [duration, setDuration] = useState(0);
    const [durationInterval, setDurationInterval] = useState(null);

    const currentRecordFile = useSelector(audioSelector);
    const dispatch = useDispatch();

    const namingPopUpRef = useRef<NamingPopUpRef>(null);
    const audioPlayerRef = useRef<AudioPlayerRef>(null);

    /**
     * Commencer à enregistrer un audio
     */
    const startRecording = useCallback(async () => {
        try {
            await Audio.requestPermissionsAsync();

            setDuration(-1);
            setIsRecording(true);
            audioPlayerRef.current.reset();

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true
            });

            const {recording} = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);

            setRecording(recording);

            setDuration(1);
            const interval = setInterval(() => {
                setDuration(d => d + 1000);
            }, 1000);

            clearInterval(durationInterval);
            setDurationInterval(interval);
        } catch (err) {
            console.error("Failed to start recording", err);
        }
    }, []);

    /**
     * Arrêter l'enregistrement en cours
     */
    const stopRecording = useCallback(async (forced = false) => {
        setIsRecording(false);

        if (forced) {
            setRecording(null);
        } else {
            dispatch(setAudio({
                uri: recording.getURI(),
                name: null,
                origin: "record"
            }));
        }

        setDuration(0);
        clearInterval(durationInterval);

        try {
            await recording.stopAndUnloadAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false
            });
        } catch (err) {
            console.error("Failed to stop recording WTF", err);
        }
    }, [recording, durationInterval]);

    /**
     * Supprimer l'audio sélectionné
     */
    const deleteAudio = useCallback(() => {
        FileSystem.deleteAsync(currentRecordFile.uri).then(() => {
            dispatch(setAudio(audios[0]));
            audioPlayerRef.current.reset();
            setAudios(audios.filter(audio => audio.uri !== currentRecordFile.uri));
        });
    }, [currentRecordFile, audios]);

    const importFile = useCallback(() => {
        DocumentPicker.getDocumentAsync({type: "audio/*", copyToCacheDirectory: false}).then(async file => {
            if (file.type === "success") {
                const to = `${IMPORT_STORAGE}/${file.name}.${file.mimeType.split("/")[1]}`;
                FileSystem.copyAsync({
                    from: file.uri,
                    to: to
                }).then(async () => {
                    setAudios(await getAudios());

                    dispatch(setAudio({
                        name: file.name,
                        uri: to,
                        origin: "import"
                    }));
                }).catch(err => console.error(err));
            }
        });
    }, []);

    const saveAudio = useCallback(async () => {
        namingPopUpRef.current.getNewName().then(async name => {
            const path = `${AUDIO_STORAGE}/${name}.m4a`;

            await FileSystem.moveAsync({
                from: currentRecordFile.uri,
                to: path
            });

            dispatch(setAudio({
                uri: path,
                name: name,
                origin: "record"
            }));
            setRecording(null);

            setAudios(await getAudios());
        }).catch(err => console.log(err));
    }, [currentRecordFile]);

    // --- UseEffects --- //

    /**
     * Initialiser la liste des audios disponibles
     */
    useEffect(() => {
        getAudios().then(audios => {
            setAudios(audios);

            if (!currentRecordFile.uri) {
                dispatch(setAudio(audios[0]));
            }
        });
    }, []);

    /**
     * Mettre à jour les données de l'audio sélectionné
     */
    useEffect(() => {
        audioPlayerRef.current.reset();
    }, [currentRecordFile]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.audioList}>
                <AudioList audios={audios} currentRecordFile={currentRecordFile}
                           onPress={(audio) => dispatch(setAudio(audio))}/>

                <View style={{flexDirection: "row-reverse", alignItems: "center"}}>
                    <View style={{alignItems: "center", flexDirection: "row-reverse"}}>
                        <IconButton icon={isRecording ? "microphone" : "microphone-off"}
                                    mode={"contained"} size={32}
                                    onPress={isRecording ? () => stopRecording() : startRecording}/>
                        {
                            duration < 0 && (
                                <ActivityIndicator size={"small"}/>
                            )
                        }
                        {
                            duration > 0 && (
                                <Text>{Math.floor(duration / 1000)} second{duration / 1000 > 1 ? "s" : ""}</Text>
                            )
                        }
                    </View>
                    <View>
                        <IconButton icon={"plus"} mode={"outlined"} onPress={importFile}/>
                    </View>
                </View>
            </View>
            <NamingPopUp ref={namingPopUpRef} condition={name => !audios.find(audio => audio.name === name)}/>
            <AudioPlayer ref={audioPlayerRef} currentRecordFile={currentRecordFile} recording={recording}>
                {
                    !currentRecordFile.name ? (
                        <IconButton icon={"content-save-outline"} size={32} style={{borderWidth: 0}}
                                    iconColor={"green"} onPress={saveAudio}/>
                    ) : (
                        <IconButton icon={"trash-can-outline"} size={32} style={{borderWidth: 0}}
                                    iconColor={"red"} onPress={deleteAudio}
                                    disabled={!currentRecordFile.uri || currentRecordFile.origin === "default"}/>
                    )
                }
            </AudioPlayer>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        width: "100%"
    },
    audioList: {
        flex: 1,
        marginTop: 30,
        width: "100%",
        paddingHorizontal: 10
    }
});

export default RecordScreen;