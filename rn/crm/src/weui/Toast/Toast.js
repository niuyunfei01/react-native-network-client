import React from 'react';
import PropTypes from 'prop-types';
import {
  ActivityIndicator,
  ActivityIndicatorIOS,
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
  ViewPropTypes
} from 'react-native'
import {Icon} from '../Icon'
import $V from '../variable'

const styles = StyleSheet.create({
  toastWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  toast: {
    width: $V.baseFontSize * 7.6,
    height: $V.baseFontSize * 7.6,
    backgroundColor: 'rgba(40, 40, 40, 0.75)',
    borderRadius: 5,
  },
  toastNoText: {
    width: $V.baseFontSize * 4.6,
    height: $V.baseFontSize * 4.6,
    backgroundColor: 'rgba(40, 40, 40, 0.75)',
    borderRadius: 5,
  },
  toastIcon: {
    marginTop: 22,
    color: '#fff',
    fontSize: 55,
    textAlign: 'center',
  },
  toastContent: {
    marginBottom: 15,
    color: '#fff',
    textAlign: 'center',
  },
  toastLoading: {
    marginTop: 30,
    marginBottom: 15
  },
  toastLoadingNoText: {
    marginTop: 15,
    marginBottom: 15
  }
})

const renderLoading = (hasText) => {
  if (Platform.OS === 'ios') {
    return <ActivityIndicatorIOS color="#fff" size="large"
                                 style={hasText ? styles.toastLoading : styles.toastLoadingNoText}/>
  }
  return <ActivityIndicator color="#fff" size="large"
                            style={hasText ? styles.toastLoading : styles.toastLoadingNoText}/>
}

const Toast = (props) => {
  const {
    icon = 'loading',
    show = false,
    onShow,
    style,
    wrapperStyle,
    textStyle,
    children,
    onRequestClose = (() => {
    })
  } = props;

  const hasChildren = !!children;

  return (
      <Modal
          animationType="fade"
          transparent={!false}
          visible={show}
          onShow={onShow}
          onRequestClose={onRequestClose}
      >
        <View style={[styles.toastWrapper, wrapperStyle]}>
          <View style={[hasChildren ? styles.toast : styles.toastNoText, style]}>
            {icon === 'loading' ? renderLoading(hasChildren) : <Icon name={icon} style={[styles.toastIcon]}/>}
            {hasChildren && <Text style={[styles.toastContent, textStyle]}>{children} </Text>}
          </View>
        </View>
      </Modal>
  )
}

Toast.propTypes = {
  icon: PropTypes.string,
  show: PropTypes.bool,
  onShow: PropTypes.func,
  onRequestClose: PropTypes.func,
  wrapperStyle: ViewPropTypes.style,
  style: ViewPropTypes.style,
  textStyle: Text.propTypes.style,
  children: PropTypes.node
}

export default Toast

