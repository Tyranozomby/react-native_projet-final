import {Address, RecordFile, Route} from "../../types";
import axios from "axios";
import * as FileSystem from "expo-file-system";

function addressStringify(address: Address) {
    return `${address.method}://${address.url}:${address.port}`;
}

function fetchHome(address: Address, signal: AbortSignal): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        axios.get(`${addressStringify(address)}${Route.HOME}`, {signal: signal})
            .then(res => {
                resolve(res.status === 200);
            }).catch(reject);
    });
}

function fetchGetModels(address: Address) {
    return new Promise<string[]>((resolve, reject) => {
        axios.get(`${addressStringify(address)}${Route.MODELS}`)
            .then(res => {
                if (res.status === 200) {
                    const names = res.data.models.map(m => m.split(".")[0]);
                    resolve(names);
                } else {
                    reject(res);
                }
            });
    });
}

function fetchSetModel(address: Address, model: string) {
    return new Promise<any>((resolve, reject) => {
        axios.get(`${addressStringify(address)}${Route.SET_MODEL}/${model}.onnx`)
            .then(res => {
                if (res.status === 200) {
                    resolve(res.data);
                } else {
                    reject(res);
                }
            }).catch(reject);
    });
}

function fetchRave(address: Address, audio: RecordFile) {
    return new Promise<FileSystem.FileSystemUploadResult>((resolve, reject) => {
        FileSystem.uploadAsync(`${addressStringify(address)}${Route.UPLOAD}`, audio.uri, {
            fieldName: "file",
            httpMethod: "POST",
            uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            headers: {filename: audio.uri}
        }).then(res => {
            resolve(res);
        }).catch(reject);
    });
}

function fetchDownload(address: Address) {
    return new Promise<FileSystem.FileSystemDownloadResult>((resolve, reject) => {
        FileSystem.downloadAsync(`${addressStringify(address)}${Route.DOWNLOAD}`, FileSystem.documentDirectory + "hey.wav")
            .then(res => {
                resolve(res);
            }).catch(reject);
    });
}


export {fetchHome, fetchGetModels, fetchSetModel, fetchRave, fetchDownload};