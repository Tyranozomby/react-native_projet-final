import {RadioButton, SegmentedButtons} from "react-native-paper";
import {RecordFile} from "../../types";
import {FC, useMemo, useState} from "react";
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from "react-native";

type AudioListProps = {
    audios: RecordFile[];
    currentRecordFile: RecordFile;
    onPress: (audio: RecordFile) => void;
}

const AudioList: FC<AudioListProps> = ({audios, currentRecordFile, onPress}) => {
    const buttons = useMemo(() => {
        return [{
            value: "record",
            label: "Record"
        }, {
            value: "import",
            label: "Import"
        }, {
            value: "default",
            label: "Default"
        }];
    }, []);

    const [value, setValue] = useState<string>(buttons[0].value);

    return (
        <View style={{flex: 1}}>
            <SegmentedButtons buttons={buttons} value={value} onValueChange={setValue}/>
            <FlatList style={styles.audioList} data={audios.filter(audio => audio.origin === value)}
                      renderItem={info => (
                          <TouchableOpacity style={styles.audioItem} onPress={() => onPress(info.item)}>
                              <Text style={{fontSize: 18}}>{info.item.name}</Text>
                              <RadioButton value={info.item.uri} onPress={() => onPress(info.item)}
                                           status={info.item.uri === currentRecordFile?.uri ? "checked" : "unchecked"}
                              />
                          </TouchableOpacity>
                      )}/>
        </View>
    );
};

const styles = StyleSheet.create({
    audioList: {
        flex: 1,
        marginTop: 10
    },
    audioItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 5,
        backgroundColor: "#eee",
        borderRadius: 15,
        padding: 10
    }
});

export default AudioList;