import {createSlice, PayloadAction, Slice} from "@reduxjs/toolkit";
import {RecordFile} from "../../types";

const audioSlice: Slice<RecordFile> = createSlice({
    name: "audio",
    initialState: {
        uri: null,
        name: null,
        origin: null
    },
    reducers: {
        setAudio: (state, action: PayloadAction<RecordFile>) => {
            state.uri = action.payload.uri;
            state.name = action.payload.name;
            state.origin = action.payload.origin;
        }
    }
});

export const setAudio = audioSlice.actions.setAudio as (payload: RecordFile) => PayloadAction<RecordFile>;

export const audioSelector: (state) => RecordFile = (state) => state.audio;

export const audioReducer = audioSlice.reducer;