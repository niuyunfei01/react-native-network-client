import React from 'react'
import {Modal} from "react-native";
import PropTypes from 'prop-types'
import ImageViewer from 'react-native-image-zoom-viewer';

export default class BigImage extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    urls: PropTypes.array.isRequired,
    transparent: PropTypes.bool,
    onClickModal: PropTypes.func.isRequired
  }
  
  static defaultProps = {
    transparent: true
  }
  
  onRequestClose () {
  
  }
  
  render () {
    return (
      <Modal
        visible={this.props.visible}
        transparent={true}
        onRequestClose={() => this.onRequestClose()}>
        <ImageViewer
          imageUrls={this.props.urls}
          index={0}
          onClick={() => this.props.onClickModal()}
        />
      </Modal>
    )
  }
}