import {createSlice, PayloadAction, Slice} from "@reduxjs/toolkit";
import {Address, Method} from "../../types";

const addressSlice: Slice<Address> = createSlice({
    name: "address",
    initialState: {
        method: Method.HTTP,
        url: "192.168.0.1",
        port: 8000
    },
    reducers: {
        setAddress: (state, action: PayloadAction<Address>) => {
            for (let key in action.payload) {
                state[key] = action.payload[key];
            }
        }
    }
});

export const {setAddress} = addressSlice.actions;
export const addressSelector: (state) => Address = (state) => state.address;
export const addressReducer = addressSlice.reducer;