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

export const setRemindTime = (remind_time = []) => {
  AsyncStorage.setItem('remind_time', JSON.stringify(remind_time))
    .then(() => 'success')
    .catch(() => 'error')
}

export const getRemindTime = async () => {
  try {
    return await AsyncStorage.getItem('remind_time')
  } catch (e) {
    return []
  }
}
