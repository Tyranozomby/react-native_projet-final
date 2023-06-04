import {SafeAreaView, StyleSheet, Text, View} from "react-native";
import {RootStackParamList} from "../../App";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {FC, useCallback, useEffect, useRef, useState} from "react";
import {useSelector} from "react-redux";
import {addressSelector} from "../stores/addressStore";
import {audioSelector} from "../stores/audioStore";
import {PaperSelect} from "react-native-paper-select";
import {fetchDownload, fetchGetModels, fetchRave, fetchSetModel} from "../utils/fetchUtils";
import {ActivityIndicator, Button} from "react-native-paper";
import AudioPlayer, {AudioPlayerRef} from "../components/audioPlayer";
import {RecordFile} from "../../types";

type SendScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, "Send">;
};

const SendScreen: FC<SendScreenProps> = () => {
    const address = useSelector(addressSelector);
    const audio = useSelector(audioSelector);

    const [models, setModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>("");

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [downloadAudio, setDownloadAudio] = useState<RecordFile>(null);

    const audioPlayerRef = useRef<AudioPlayerRef>(null);

    /**
     * Récupérer les modèles disponibles quand l'adresse change
     */
    useEffect(() => {
        fetchGetModels(address).then(setModels).catch(() => null);
    }, [address]);

    /**
     * Sélectionner le premier modèle par défaut
     */
    useEffect(() => {
        if (models.length > 0) {
            setSelectedModel(models[0]);
        }
    }, [models]);

    /**
     * Préviens le serveur que le modèle a changé
     */
    useEffect(() => {
        fetchSetModel(address, selectedModel).then(res => {
            console.log(res);
        });
    }, [selectedModel]);

    useEffect(() => {
        if (downloadAudio) {
            audioPlayerRef.current.reset();
            setDownloadAudio(null);
        }
    }, [audio]);

    /**
     * Lancer le RAVE
     */
    const rave = useCallback(() => {
        setIsLoading(true);
        audioPlayerRef.current.reset();

        fetchRave(address, audio).then(async () => {
            const res = await fetchDownload(address);
            setDownloadAudio({uri: res.uri, name: `${audio.name}_remix`, origin: "download"});
        }).finally(() => {
            setIsLoading(false);
        });
    }, [address, audio]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={{width: "80%"}}>
                    <PaperSelect label={"Chosen Model"} textInputMode={"outlined"}
                                 arrayList={models.map(n => ({_id: n, value: n}))}
                                 selectedArrayList={[{"_id": selectedModel, "value": selectedModel}]}
                                 multiEnable={false} value={selectedModel}
                                 onSelection={s => {
                                     if (s.selectedList.length > 0)
                                         setSelectedModel(s.text);
                                 }}/>
                </View>
                <Text style={{fontSize: 16, marginBottom: 8}}>Your audio: <Text
                    style={{fontWeight: "bold"}}>{audio.name ?? "Unnamed"}</Text></Text>

                {isLoading ?
                    <ActivityIndicator size={"small"}/> :
                    <Button onPress={rave} mode={"outlined"} disabled={isLoading}>RAVE</Button>
                }
            </View>
            <AudioPlayer ref={audioPlayerRef} currentRecordFile={downloadAudio || audio}/>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center"
    },
    content: {
        flex: 1,
        width: "80%",
        alignItems: "center",
        justifyContent: "center"
    }
});

export default SendScreen;