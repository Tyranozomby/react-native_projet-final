import {SafeAreaView, StyleSheet, Text, View} from "react-native";
import {StatusBar} from "expo-status-bar";
import {RootStackParamList} from "../../App";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {FC, useCallback, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {addressSelector, setAddress} from "../stores/addressStore";
import {Address, Method} from "../../types";
import {Button, RadioButton, TextInput} from "react-native-paper";
import {fetchHome} from "../utils/fetchUtils";

type HomeScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

const HomeScreen: FC<HomeScreenProps> = () => {

    const address: Address = useSelector(addressSelector);
    const dispatch = useDispatch();

    const [connected, setConnected] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    let controller: AbortController = null;

    /**
     * Essayer de se connecter avec les informations données
     */
    const tryConnection = useCallback(() => {
        if (controller) controller.abort();
        controller = new AbortController();

        setIsLoading(true);

        fetchHome(address, controller.signal)
            .then(setConnected)
            .catch(() => {
                setConnected(false);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [address]);

    /**
     * Annuler la requête en cours
     */
    const cancelCurrentRequest = useCallback(() => {
        if (controller) {
            controller.abort();
        }
        setIsLoading(false);
        setConnected(null);
    }, []);

    /**
     * Changer une valeur de l'adresse
     */
    const changeAddress = useCallback((key, val) => {
        dispatch(setAddress({[key]: val}));
        cancelCurrentRequest();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View>
                <View style={styles.row}>
                    {(Object.values(Method)).map((method) => (
                        <View style={styles.row} key={method}>
                            <Text>{method}</Text>
                            <RadioButton
                                value={method}
                                status={address.method === method ? "checked" : "unchecked"}
                                onPress={() => changeAddress("method", method)}
                            />
                        </View>
                    ))}
                </View>
            </View>
            <View style={styles.inputs}>
                <TextInput label={"URL"} value={address.url}
                           onChangeText={val => changeAddress("url", val)}
                           mode={"outlined"}/>
                <TextInput label={"Port"} value={String(address.port)}
                           onChangeText={val => changeAddress("port", Number(val))}
                           keyboardType={"numeric"} mode={"outlined"}/>
            </View>
            <Button
                loading={isLoading} disabled={isLoading}
                mode={"contained"}
                buttonColor={connected === null ? "" : connected ? "green" : "red"}
                onPress={tryConnection}>
                {connected === null ? "Try to connect" : connected ? "Connection success" : "Connection failed (try again)"}
            </Button>
            <StatusBar style="auto"/>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        gap: 20
    },
    inputs: {
        flexDirection: "row",
        gap: 10
    },
    row: {
        flexDirection: "row",
        alignItems: "center"
    }
});

export default HomeScreen;