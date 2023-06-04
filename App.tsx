import {NavigationContainer} from "@react-navigation/native";
import HomeScreen from "./src/screens/HomeScreen";
import {Provider} from "react-redux";
import RecordScreen from "./src/screens/RecordScreen";
import {persistor, store} from "./src/stores/store";
import {PersistGate} from "redux-persist/integration/react";
import {createMaterialTopTabNavigator} from "@react-navigation/material-top-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import SendScreen from "./src/screens/SendScreen";
import {PaperProvider} from "react-native-paper";

export type RootStackParamList = {
    Home: null;
    Record: null;
    Send: null;
}

// noinspection JSUnusedGlobalSymbols
export default function App() {
    const Tab = createMaterialTopTabNavigator<RootStackParamList>();

    return (
        <PaperProvider>
            <Provider store={store}>
                <PersistGate persistor={persistor}>
                    <NavigationContainer>
                        <Tab.Navigator
                            tabBarPosition={"bottom"}
                            screenOptions={({route}) => ({
                                tabBarIcon: ({focused, color}) => {
                                    const icons = {
                                        Home: ["home", "home-outline"],
                                        Record: ["recording", "recording-outline"],
                                        Send: ["send", "send-outline"]
                                    };

                                    const iconName = focused ? icons[route.name][0] : icons[route.name][1];
                                    return <Icon name={iconName} size={24} color={color}/>;
                                },
                                tabBarActiveTintColor: "#333",
                                tabBarInactiveTintColor: "gray"
                            })}
                        >
                            <Tab.Screen name={"Home"} component={HomeScreen}/>
                            <Tab.Screen name={"Record"} component={RecordScreen}/>
                            <Tab.Screen name={"Send"} component={SendScreen}/>
                        </Tab.Navigator>
                    </NavigationContainer>
                </PersistGate>
            </Provider>
        </PaperProvider>
    );
}