import * as FileSystem from "expo-file-system";
import {Asset} from "expo-asset";
import {RecordFile} from "../../types";

const AUDIO_STORAGE = FileSystem.documentDirectory + "audios";
const IMPORT_STORAGE = FileSystem.documentDirectory + "imports";

/**
 * Initialiser les dossiers de stockage
 */
async function initDirectories() {
    const [audioDir, importDir] = await Promise.all([
        FileSystem.getInfoAsync(AUDIO_STORAGE),
        FileSystem.getInfoAsync(IMPORT_STORAGE)
    ]);

    await Promise.all([
        !audioDir.exists && FileSystem.makeDirectoryAsync(AUDIO_STORAGE),
        !importDir.exists && FileSystem.makeDirectoryAsync(IMPORT_STORAGE)
    ]);
}

/**
 * Initialiser/actualiser la liste des audios disponibles
 */
async function getAudios() {
    await initDirectories();

    const [customDir, importDir, audioAssets] = await Promise.all([
        FileSystem.readDirectoryAsync(AUDIO_STORAGE),
        FileSystem.readDirectoryAsync(IMPORT_STORAGE),
        // J'ai pas trouvé comment faire pour récupérer tous les assets du dossier
        Asset.loadAsync(require("../../assets/audio/test_sample.wav"))
    ]);

    const audios = audioAssets.map<RecordFile>(asset => ({
        uri: asset.localUri,
        name: asset.name,
        origin: "default"
    }));

    audios.push(...importDir.map<RecordFile>(file => ({
        uri: IMPORT_STORAGE + "/" + file,
        name: file.split(".").slice(0, -1).join("."),
        origin: "import"
    })));

    audios.push(...customDir.map<RecordFile>(file => ({
        uri: AUDIO_STORAGE + "/" + file,
        name: file.split(".").slice(0, -1).join("."),
        origin: "record"
    })));

    return audios;
}

export {getAudios, AUDIO_STORAGE, IMPORT_STORAGE};