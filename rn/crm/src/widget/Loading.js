'use strict';

import ReactNative from 'react-native';
import React from 'react'
import Portal from 'react-native/Libraries/Portal/Portal.js';

const {
  Platform,
  StyleSheet,
  Dimensions,
  View,
  Text,
  Modal,
  ActivityIndicatorIOS,
  ActivityIndicator
} = ReactNative;

const SIZES = ['small', 'normal', 'large'];
let tag;

const propTypes = {
  visible: PropTypes.bool,
  color: PropTypes.string,
  size: PropTypes.oneOf(SIZES),
  overlayColor: PropTypes.string
}

class Loading extends React.Component {
  constructor(props) {
    super(props);
    this.renderLoading = this.renderLoading.bind(this);
    this.renderSpinner = this.renderSpinner.bind(this);
  }

  UNSAFE_componentWillMount() {
    if (Platform.OS === 'android') {
      tag = Portal.allocateTag();
    }
  }

  componentDidUpdate(prevProps) {
    if (Platform.OS !== 'android') {
      return;
    }
    if (!prevProps.visible && this.props.visible) {
      return Portal.showModal(tag, this.renderSpinner());
    }
    Portal.closeModal(tag);
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      tag = null;
    }
  }

  renderLoading() {
    let styleAttr = 'Inverse';
    let size = 'large';

    switch (this.props.size) {
      case 'small':
        styleAttr = 'SmallInverse';
        size = 'small';
        break;
      case 'large':
        styleAttr = 'LargeInverse';
        size = 'large';
        break;
    }
    if (Platform.OS === 'android') {
      return (
        <View style={styles.loading}>
          <ActivityIndicator
            styleAttr={styleAttr}
            color={this.props.color}
          />
          <Text style={styles.loadingText}>数据加载中...</Text>
        </View>
      );
    } else {
      return (
        <ActivityIndicatorIOS
          animating={true}
          size={size}
          color={this.props.color}
        />
      );
    }
  }

  renderSpinner() {
    if (!this.props.visible) {
      return (
        <View key={'spinner'}/>
      );
    }
    let spinner = (
      <View
        key={'spinner'}
        style={styles.container}
      >
        <View style={[styles.background, {backgroundColor: this.props.overlayColor}]}>
          {this.renderLoading()}
        </View>
      </View>
    );
    if (Platform.OS === 'android') {
      return spinner;
    }
    return (
      <Modal
        visible={this.props.visible}
        transparent={true}
      >
        {spinner}
      </Modal>
    );
  }

  render() {
    if (Platform.OS === 'android') {
      return <View/>
    }
    return this.renderSpinner();
  }
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  background: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width / 2.5,
    height: Dimensions.get('window').width / 2.5,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.25)'
  },
  loadingText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#fcfcfc'
  }
})

Loading.propTypes = propTypes;

Loading.defaultProps = {
  visible: false,
  color: 'white',
  size: 'large',
  overlayColor: 'transparent'
}

export default Loading;
