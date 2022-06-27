import RNFetchBlob from "rn-fetch-blob";
import {Platform} from "react-native";

const {DocumentDir, CacheDir, MainBundleDir} = RNFetchBlob.fs.dirs
export const logFilePath = CacheDir + '/log.txt'
export const bundleFilePath = Platform.OS === 'ios' ? MainBundleDir : DocumentDir
export const appendFile = async (content, filePath) => {
    return await RNFetchBlob.fs.appendFile(filePath, content + '\r\n', 'utf8')
}

export const readFile = async (filePath) => {
    return await RNFetchBlob.fs.readFile(filePath, 'utf8', -1)
}

export const deleteFile = async (filePath) => {
    return await RNFetchBlob.fs.unlink(filePath)
}

export const readFileInfo = async (filePath) => {
    return await RNFetchBlob.fs.lstat(filePath)
}

export const exists = async (filePath) => {
    return await RNFetchBlob.fs.exists(filePath)
}

export const createFile = async (filePath, data) => {
    return await RNFetchBlob.fs.createFile(filePath, data, 'utf8')
}
