import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Text,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
  ViewPropTypes
} from 'react-native'
import StyleSheet from '../StyleSheet'
import $V from '../variable'
import pxToDp from "../../pubilc/util/pxToDp";
import JbbText from "../../scene/common/component/JbbText";

const styles = StyleSheet.create({
  dialogWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: 'rgba(0,0,0,.6)',
  },
  dialog: {
    width: Dimensions.get('window').width - 60,
    backgroundColor: $V.weuiDialogBackgroundColor,
    borderRadius: 3,
    overflow: 'hidden',
  },
  dialogHeader: {
    // paddingTop: 1.2 * $V.baseFontSize,
    // paddingBottom: 0.5 * $V.baseFontSize,

    paddingTop: pxToDp(40),
  },
  dialogTitle: {
    // fontWeight: '400',
    // fontSize: 17,
    // textAlign: 'center',
    fontSize: pxToDp(32),
    marginHorizontal: pxToDp(48),
    color: '#3e3e3e',
  },
  dialogBody: {
    // paddingLeft: 20,
    // paddingRight: 20,
    marginTop: pxToDp(34),
    marginHorizontal: pxToDp(48),

    // borderColor: 'red',
    // borderWidth: pxToDp(1),
  },
  dialogBodyText: {
    // fontSize: 15,
    // textAlign: 'center',
    // color: $V.globalTextColor,
    lineHeight: 15 * $V.baseLineHeight,
    android: {
      lineHeight: Math.round(15 * $V.baseLineHeight),
    },

    fontSize: pxToDp(30),
    color: '#777',
  },
  dialogFooter: {
    // marginTop: 30,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: $V.weuiDialogLineColor,
    borderStyle: 'solid',

    marginTop: pxToDp(50),
    marginBottom: pxToDp(21),
    marginHorizontal: pxToDp(10),

    // borderColor: 'red',
    // borderWidth: pxToDp(1),
  },
  otherStyle: {
    width: '50%',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  mainStyle: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  dialogFooterOpr: {
    height: 42,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',

    // borderColor: 'red',
    // borderWidth: pxToDp(1),
  },
  dialogFooterOprWithBorder: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderColor: $V.weuiDialogLineColor,
    borderStyle: 'solid',
  },
  dialogFooterOprText: {
    // fontSize: 17,
    fontSize: pxToDp(28),
    color: '#59b26a',
  },
  defaultDialogFooterOprText: {
    color: '#353535',
  },
  primaryDialogFooterOprText: {
    color: '#0BB20C',
  },
  warnDialogFooterOprText: {
    color: $V.globalWarnColor,
  }
})

const underlayColor = $V.weuiDialogLinkActiveBc

class Dialog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fadeAnim: new Animated.Value(0),
      visible: false,
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible) {
      if (nextProps.visible) {
        this.setState({visible: true})
        Animated.timing(
            this.state.fadeAnim,
            {
              toValue: 1,
              useNativeDriver: true,
              duration: this.props.duration || 200,
              easing: Easing.easeOut,
            }
        ).start()
      } else {
        Animated.timing(
            this.state.fadeAnim,
            {
              toValue: 0,
              useNativeDriver: true,
              duration: this.props.duration || 200,
              easing: Easing.easeOut,
            }
        ).start(() => this.setState({visible: false}))
      }
    }
  }

  _renderButtons() {
    return this.props.buttons && this.props.buttons.map((button, idx) => {
      const {
        type,
        label,
        sty,
        textsty,
        ...others
      } = button;
      return (
          <TouchableHighlight
              key={idx}
              style={[styles.dialogFooterOpr, idx > 0 ? styles.dialogFooterOprWithBorder : {}, sty]}
              underlayColor={underlayColor}
              {...others}
          >
            <Text
                style={[styles.dialogFooterOprText, styles[`${type}DialogFooterOprText`], textsty]}
            >{label} </Text>
          </TouchableHighlight>
      );
    })
  }

  _renderOtherButtons() {
    let len = (this.props.left_buttons || {}).length;
    return this.props.left_buttons.map((button, idx) => {
      const {
        type,
        label,
        ...others
      } = button;
      return (
          <TouchableHighlight
              key={idx}
              style={[styles.dialogFooterOpr, len === 1 && {marginLeft: pxToDp(30)}, idx > 0 ? styles.dialogFooterOprWithBorder : {}]}
              underlayColor={underlayColor}
              {...others}
          >
            <Text
                style={[styles.dialogFooterOprText]}
            >{label} </Text>
          </TouchableHighlight>
      )
    });
  }

  render() {
    const {
      title,
      titleRight,
      style,
      wrapperStyle,
      headerStyle,
      headerRightStyle,
      titleStyle,
      titleRightStyle,
      bodyStyle,
      bodyTextStyle,
      footerStyle,
      children,
      onShow,
      onRequestClose,
    } = this.props;

    const childrenWithProps = React.Children.map(children, (child) => {
      if (child.type.displayName === 'Text') {
        return React.cloneElement(child, {
          style: [styles.dialogBodyText, bodyTextStyle, child.props.style]
        })
      }
      return child
    });

    let o_len = (this.props.left_buttons || {}).length;

    return (
        <Modal
            visible={this.state.visible}
            transparent={!false}
            onShow={onShow}
            onRequestClose={onRequestClose}
        >
          <TouchableWithoutFeedback onPress={onRequestClose}>
            <Animated.View
                style={[styles.dialogWrapper, wrapperStyle, {opacity: this.state.fadeAnim}]}
            >
              <Animated.View style={{opacity: this.state.fadeAnim}}>
                <View style={[styles.dialog, style]}>
                  {!!title &&
                  <View style={[styles.dialogHeader, headerStyle]}>
                    <Text style={[styles.dialogTitle, titleStyle]}>{title} </Text>
                  </View>
                  }
                  {!!titleRight &&
                  <View style={[headerRightStyle]}>
                    <JbbText style={[titleRightStyle]}>{titleRight}</JbbText>
                  </View>
                  }
                  <View style={[styles.dialogBody, bodyStyle]}>
                    {childrenWithProps}
                  </View>
                  <View style={[styles.dialogFooter, footerStyle]}>
                    {o_len > 0 &&
                    <View style={[styles.otherStyle]}>
                      {this._renderOtherButtons('other')}
                      {o_len === 1 && <View style={styles.dialogFooterOpr}/>}
                    </View>}
                    <View style={[styles.mainStyle, o_len > 0 && {width: '50%'}]}>
                      {this._renderButtons()}
                    </View>
                  </View>
                </View>
              </Animated.View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Modal>
    )
  }
}

Dialog.propTypes = {
  title: PropTypes.string,
  titleRight: PropTypes.string,
  buttons: PropTypes.array,
  left_buttons: PropTypes.array,
  visible: PropTypes.bool,
  onShow: PropTypes.func,
  duration: PropTypes.number,
  onRequestClose: PropTypes.func,
  style: ViewPropTypes.style,
  wrapperStyle: ViewPropTypes.style,
  headerStyle: ViewPropTypes.style,
  headerRightStyle: ViewPropTypes.style,
  titleStyle: Text.propTypes.style,
  titleRightStyle: Text.propTypes.style,
  bodyStyle: ViewPropTypes.style,
  bodyTextStyle: Text.propTypes.style,
  footerStyle: ViewPropTypes.style,
  children: PropTypes.node
}

export default Dialog
