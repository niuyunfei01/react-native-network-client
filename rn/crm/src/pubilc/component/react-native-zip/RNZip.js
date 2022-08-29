import ReactNative from "react-native";

const {NativeModules} = ReactNative;

const RNZipArchive = NativeModules.RNZipArchive;

const normalizeFilePath = (path) =>
  path.startsWith("file://") ? path.slice(7) : path;

export const unzip = (source, target, charset = "UTF-8") => {
  return RNZipArchive.unzip(normalizeFilePath(source), normalizeFilePath(target), charset);
};
