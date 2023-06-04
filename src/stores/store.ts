import {combineReducers, configureStore} from "@reduxjs/toolkit";
import {addressReducer} from "./addressStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {persistReducer, persistStore} from "redux-persist";
import thunk from "redux-thunk";
import {audioReducer} from "./audioStore";

const reducers = combineReducers({address: addressReducer, audio: audioReducer});

const persistConfig = {
    key: "root",
    storage: AsyncStorage
};
const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: [thunk]
});


export const persistor = persistStore(store);