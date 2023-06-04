import React, {forwardRef, useImperativeHandle} from "react";
import {Button, Dialog, Portal, TextInput} from "react-native-paper";
import {Text} from "react-native";

type NamingPopUpProps = {
    condition: (newName) => boolean
}

export type NamingPopUpRef = {
    getNewName: () => Promise<string>
}

const NamingPopUp = forwardRef<NamingPopUpRef, NamingPopUpProps>(({condition}, ref) => {
    const [visible, setVisible] = React.useState(false);
    const [newName, setNewName] = React.useState("");
    const [errorMessage, setErrorMessage] = React.useState("");

    const [promise, setPromise] = React.useState(null);

    const onDismiss = () => {
        setVisible(false);
        promise.reject("User cancelled naming");
    };

    const onConfirm = () => {
        if (newName && condition(newName)) {
            setVisible(false);
            promise.resolve(newName);
            setNewName("");
        } else {
            setErrorMessage("This name is already taken");
        }
    };

    /**
     * Fonction à appeler depuis l'extérieur pour récupérer le nom donné
     */
    useImperativeHandle(ref, () => ({
        getNewName() {
            setErrorMessage("");
            setVisible(true);

            return new Promise<string>((resolve, reject) => {
                setPromise({resolve, reject});
            });
        }
    }));


    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>Name your new audio</Dialog.Title>
                <Dialog.Content>
                    <TextInput mode={"outlined"} label={"Audio name"} onChangeText={setNewName}/>

                    <Text style={{color: "red"}}>{errorMessage}</Text>

                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onDismiss}>Cancel</Button>
                    <Button onPress={onConfirm}>Confirm</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
});

export default NamingPopUp;