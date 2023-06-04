export type Address = {
    method: Method,
    url: string,
    port: number
}

export enum Method {
    HTTP = "http",
    HTTPS = "https"
}

export type RecordFile = {
    uri: string,
    name: string
    origin: RecordOrigin
}

export type RecordOrigin = "import" | "record" | "default" | "download";

export enum Route {
    HOME = "/",
    UPLOAD = "/upload",
    DOWNLOAD = "/download",
    MODELS = "/getmodels",
    SET_MODEL = "/selectModel"
}