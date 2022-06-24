import RNFetchBlob from "rn-fetch-blob";

export const {DocumentDir, CacheDir} = RNFetchBlob.fs.dirs
export const logFilePath = CacheDir + '/log.txt'

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

export const createFile = async (filePath) => {
  return await RNFetchBlob.fs.createFile(filePath, ' ', 'utf8')
}
