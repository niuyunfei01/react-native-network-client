import React from 'react'
import {RNCamera} from "react-native-camera";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native'
import PropType from 'prop-types'
import tool from "../util/tool";
import Sound from 'react-native-sound';

Sound.setCategory('Playback');
const barCodeTypes = [
  RNCamera.Constants.BarCodeType.aztec,
  RNCamera.Constants.BarCodeType.code128,
  RNCamera.Constants.BarCodeType.code39,
  RNCamera.Constants.BarCodeType.code39mod43,
  RNCamera.Constants.BarCodeType.code93,
  RNCamera.Constants.BarCodeType.ean13,
  RNCamera.Constants.BarCodeType.ean8,
  RNCamera.Constants.BarCodeType.pdf417,
  RNCamera.Constants.BarCodeType.upc_e,
  RNCamera.Constants.BarCodeType.interleaved2of5,
  RNCamera.Constants.BarCodeType.itf14,
  RNCamera.Constants.BarCodeType.datamatrix,
]
const googleVisionBarcodeType = RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType.DATA_MATRIX
const googleVisionBarcodeMode = RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeMode.ALTERNATE

let allowPlay = true

class Scanner extends React.Component {
  static propTypes = {
    visible: PropType.bool.isRequired,
    onClose: PropType.func.isRequired,
    onScanSuccess: PropType.func,
    onScanFail: PropType.func,
    title: PropType.string
  }

  static defaultProps = {
    title: '扫码'
  }

  constructor(props) {
    super(props);
    this.state = {
      moveAnim: new Animated.Value(0),

    };
  }

  componentDidMount() {
    this.startAnimation();
  }

  startAnimation = () => {
    this.state.moveAnim.setValue(0);
    Animated.timing(
      this.state.moveAnim,
      {
        toValue: -200,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true
      }
    ).start(() => this.startAnimation());
  };

  //  识别二维码

  onGoogleVisionBarcodesDetected = (event) => {

    const {barcodes = []} = event
    console.log('barcodes', barcodes)
    if (barcodes[0] && allowPlay) {
      allowPlay = false
      this.props.onScanSuccess && this.props.onScanSuccess(barcodes[0].data)
      // 扫码提示音
      const whoosh = new Sound('scanner.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          return;
        }
        //  loaded successfully
        // console.log('duration in seconds: ' + whoosh.getDuration() + 'number of channels: ' + whoosh.getNumberOfChannels());

        // Play the sound with an onEnd callback
        whoosh.play((success) => {
          if (success) {
            whoosh.pause()
            whoosh.setNumberOfLoops(1);
            whoosh.release();

            //手机振动
            switch (Platform.OS) {
              case "android":
                Vibration.vibrate([0, 100], false)
                break
              case "ios":
                Vibration.vibrate(100, false)
                break
            }
            this.props.onClose()

          }
          allowPlay = true
        });
      });

      return
    }
    if (tool.length(barcodes) <= 0) {
      this.props.onScanFail && this.props.onScanFail('')
      this.props.onClose()

    }
  }

  onBarCodeRead = (result) => {
    const {data} = result;
    if (data && allowPlay) {
      allowPlay = false
      this.props.onScanSuccess && this.props.onScanSuccess(data)
      // 扫码提示音
      const whoosh = new Sound('scanner.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          whoosh.pause()
          whoosh.release();
          allowPlay = true
          this.props.onClose && this.props.onClose()
          return;
        }
        //  loaded successfully
        // console.log('duration in seconds: ' + whoosh.getDuration() + 'number of channels: ' + whoosh.getNumberOfChannels());

        // Play the sound with an onEnd callback
        whoosh.play((success) => {
          if (success) {
            whoosh.pause()
            whoosh.setNumberOfLoops(1);
            whoosh.release();

            //手机振动
            switch (Platform.OS) {
              case "android":
                Vibration.vibrate([0, 100], false)
                break
              case "ios":
                Vibration.vibrate(100, false)
                break
            }
          }
          allowPlay = true
          this.props.onClose && this.props.onClose()
        });
      });

    }
  }

  render() {
    const {visible, onClose, title} = this.props
    return (

      <Modal visible={visible} onRequestClose={onClose} hardwareAccelerated={true} transparent={true}>
        <SafeAreaView style={{flex: 1, backgroundColor: '#4a4a4a'}}>
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.title}>{title} </Text>
              </TouchableOpacity>
            </View>
            <RNCamera
              ref={ref => this.camera = ref}
              style={styles.preview}
              type={RNCamera.Constants.Type.back}
              flashMode={RNCamera.Constants.FlashMode.on}
              barCodeTypes={barCodeTypes}
              detectedImageInEvent={false}
              onBarCodeRead={this.onBarCodeRead}
              googleVisionBarcodeType={googleVisionBarcodeType}
              googleVisionBarcodeMode={googleVisionBarcodeMode}
              captureAudio={false}

            >
              <View style={styles.rectangleContainer}>
                <View style={styles.rectangle}/>
                <Animated.View style={[styles.border, {transform: [{translateY: this.state.moveAnim}]}]}/>
                <Text style={styles.rectangleText}>将二维码/条码放入框内，即可自动扫描 </Text>
              </View>
            </RNCamera>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    height: '100%'
  },
  header: {
    height: 40,
    paddingHorizontal: 10,
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#000'
  },
  title: {
    marginLeft: 10,
    color: '#fff',
    fontSize: 16
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  rectangleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  rectangle: {
    height: 200,
    width: 300,
    borderWidth: 1,
    borderColor: '#00FF00',
    backgroundColor: 'transparent'
  },
  rectangleText: {
    flex: 0,
    color: '#fff',
    marginTop: 10
  },
  border: {
    flex: 0,
    width: 300,
    height: 2,
    backgroundColor: '#00FF00',
  }
});

export default Scanner
