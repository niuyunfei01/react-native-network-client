import AsyncStorage from '@react-native-async-storage/async-storage';

export const setNoLoginInfo = (noLoginInfo) => {

  AsyncStorage.setItem('noLoginInfo', noLoginInfo).then(() => {
    return 'success'
  }).catch(() => {
    return 'error'
  })


}

export const getNoLoginInfo = async () => {
  return await AsyncStorage.getItem('noLoginInfo')
}
