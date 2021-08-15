'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Modal,
  Text,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ViewPropTypes as RNViewPropTypes,
} from 'react-native';

import BaseComponent from './BaseComponent';
import Icon from "../../weui/Icon/Icon";
import pxToDp from "../../util/pxToDp";
import * as TextStylePropTypes from "react-native";

const ViewPropTypes = RNViewPropTypes || View.propTypes;

let componentIndex = 0;

const propTypes = {
  data: PropTypes.array,
  onChange: PropTypes.func,
  skin: PropTypes.string,//['default', 'customer']
  defaultKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),//默认选项的key
  defaultSelectStyle: ViewPropTypes.style,//默认选项的样式
  //defaultTextStyle: TextStylePropTypes.style,//默认选项的文本样式
  checkMark: PropTypes.bool,//默认选项的对号(默认开启)
  bottomLine: PropTypes.bool,//默认选项的对号(默认开启)-只在customer模式下生效
  animationType: ViewPropTypes.style,
  style: ViewPropTypes.style,
  initValue: PropTypes.string,//在使用单标签时默认显示的文本
  selectStyle: ViewPropTypes.style,//选择元素的样式定义（仅在默认模式下可用！）。注意：由于React Native中的更改，RN <0.39.0应该flex:1明确地传递给selectStyle支持。
  //selectTextStyle: TextStylePropTypes.style,//选择元素的样式定义（仅在默认模式下可用）
  optionStyle: ViewPropTypes.style,//选项元素的样式定义
  //optionTextStyle: TextStylePropTypes.style,//选项文本元素的样式定义
  optionContainerStyle: ViewPropTypes.style,//选项容器元素的样式定义 | 大的框样式
  sectionStyle: ViewPropTypes.style,//选择元素的样式定义|section: true 的样式 - 已被当做头样式处理, 被选中请用defaultKey
//  sectionTextStyle: TextStylePropTypes.style,//选择文本元素的样式定义|section: true 的样式 - 已被当做头样式处理, 被选中请用defaultKey
  cancelStyle: ViewPropTypes.style,// 取消元素的样式定义
 // cancelTextStyle: TextStylePropTypes.style,//取消文本元素的样式定义
  overlayStyle: ViewPropTypes.style,//覆盖背景元素的样式定义
  cancelText: PropTypes.string,
  disabled: PropTypes.bool,
  supportedOrientations: PropTypes.arrayOf(PropTypes.oneOf(['portrait', 'landscape', 'portrait-upside-down', 'landscape-left', 'landscape-right'])),
  keyboardShouldPersistTaps: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  backdropPressToClose: PropTypes.bool,
  modalVisible: PropTypes.bool,
};

const defaultProps = {
  data: [],
  onChange: () => {
  },
  initValue: 'Select me!',
  skin: 'default',
  defaultKey: '',
  defaultSelectStyle: {},
  defaultTextStyle: {},
  animationType: 'slide',
  style: {},
  selectStyle: {},
  selectTextStyle: {},
  optionStyle: {},
  optionTextStyle: {},
  optionContainerStyle: {},
  sectionStyle: {},
  sectionTextStyle: {},
  cancelStyle: {},
  cancelTextStyle: {},
  overlayStyle: {},
  cancelText: '取消',
  disabled: false,
  checkMark: true,
  bottomLine: false,
  supportedOrientations: ['portrait', 'landscape'],
  keyboardShouldPersistTaps: 'always',
  backdropPressToClose: false,
  modalVisible: false,
};

export default class ModalSelector extends BaseComponent {

  constructor() {

    super();

    this._bind(
      'onChange',
      'open',
      'close',
      'renderChildren'
    );

    this.state = {
      modalVisible: false,
      transparent: false,
      selected: 'please select',
    };
  }


  componentDidMount() {
    this.setState({selected: this.props.initValue});
    this.setState({cancelText: this.props.cancelText});
    this.setState({modalVisible: this.props.modalVisible});
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.initValue !== this.props.initValue) {
      this.setState({selected: nextProps.initValue});
    }
  }

  onChange(item) {
    this.props.onChange(item);
    this.setState({selected: item.label});
    this.close();
  }

  close() {
    this.setState({
      modalVisible: false,
    });
  }

  open() {
    this.setState({
      modalVisible: true,
    });
  }

  renderSection(section, styles, bottom_line) {

    return (
      <View key={section.key} style={[bottom_line, styles.sectionStyle, this.props.sectionStyle]}>
        <Text style={[styles.sectionTextStyle, this.props.sectionTextStyle]}>{section.label}</Text>
      </View>
    );
  }

  renderDefault(default_section, styles, bottom_line) {
    let checkMark = this.props.checkMark ? {flexDirection: 'row', justifyContent: 'center', paddingLeft: 20} : null;

    return (
      <View key={default_section.key} style={[
        bottom_line,
        checkMark,
        styles.defaultSelectStyle,
        this.props.defaultSelectStyle,
      ]}>
        <Text style={[styles.defaultTextStyle, this.props.defaultTextStyle]}>{default_section.label}</Text>
        {checkMark !== null && <Icon name="success_no_circle" style={{fontSize: 16, marginLeft: pxToDp(5)}}/>}
      </View>
    );
  }

  renderOption(option, styles, bottom_line) {

    return (
      <TouchableOpacity key={option.key} onPress={() => this.onChange(option)}>
        <View style={[bottom_line, styles.optionStyle, this.props.optionStyle]}>
          <Text style={[styles.optionTextStyle, this.props.optionTextStyle]}>{option.label}</Text>
        </View>
      </TouchableOpacity>);
  }

  renderOptionList(styles) {
    let last_item = this.props.data.length-1;
    let bottomLine = this.props.bottomLine;
    let options = this.props.data.map((item, key) => {
      let bottom_line = last_item !== key ? styles.bottom_line : (bottomLine ?  styles.bottom_line : null);

      if (item.section) {
        return this.renderSection(item, styles, bottom_line);
      } else if (parseInt(this.props.defaultKey) === parseInt(item.key)) {
        return this.renderDefault(item, styles, bottom_line);
      }
      return this.renderOption(item, styles, bottom_line);
    });

    const closeOverlay = this.props.backdropPressToClose;

    return (
      <TouchableWithoutFeedback key={'modalSelector' + (componentIndex++)} onPress={() => {
        closeOverlay && this.close()
      }}>
        <View style={[styles.overlayStyle, this.props.overlayStyle]}>
          <View style={[styles.optionContainer, this.props.optionContainerStyle]}>
            <ScrollView keyboardShouldPersistTaps={this.props.keyboardShouldPersistTaps}>
              <View style={{paddingHorizontal: 10}}>
                {options}
              </View>
            </ScrollView>
          </View>

          {!this.props.modalVisible ? (<View style={styles.cancelContainer}>
            <TouchableOpacity onPress={this.close}>
              <View style={[styles.cancelStyle, this.props.cancelStyle]}>
                <Text style={[styles.cancelTextStyle, this.props.cancelTextStyle]}>{this.props.cancelText}</Text>
              </View>
            </TouchableOpacity>
          </View>) : null}
        </View>
      </TouchableWithoutFeedback>);
  }

  renderChildren(styles) {
    if (this.props.children) {
      return this.props.children;
    }
    return (
      <View style={[styles.selectStyle, this.props.selectStyle]}>
        <Text style={[styles.selectTextStyle, this.props.selectTextStyle]}>{this.state.selected}</Text>
      </View>
    );
  }

  render() {
    let styles = this.props.skin === 'customer' ? customer_styles : default_styles;

    const dp = (
      <Modal
        transparent={true}
        ref={element => this.model = element}
        supportedOrientations={this.props.supportedOrientations}
        visible={this.state.modalVisible}
        onRequestClose={this.close}
        animationType={this.props.animationType}
      >
        {this.renderOptionList(styles)}
      </Modal>
    );

    return (
      <View style={this.props.style}>
        {dp}
        <TouchableOpacity onPress={this.open} disabled={this.props.disabled}>
          <View pointerEvents="none">
            {this.renderChildren(styles)}
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

ModalSelector.propTypes = propTypes;
ModalSelector.defaultProps = defaultProps;


const PADDING = 8;
const BORDER_RADIUS = 5;
const FONT_SIZE = 16;
const HIGHLIGHT_COLOR = 'rgba(0,118,255,0.9)';

const default_styles = StyleSheet.create({

  overlayStyle: {
    flex: 1,
    padding: '5%',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },

  optionContainer: {
    borderRadius: BORDER_RADIUS,
    flexShrink: 1,
    marginBottom: 8,
    padding: PADDING,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },

  cancelContainer: {
    flexGrow: 1,
    maxHeight: 30,
    alignSelf: 'stretch',
  },

  selectStyle: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: PADDING,
    borderRadius: BORDER_RADIUS,
  },

  selectTextStyle: {
    textAlign: 'center',
    color: '#333',
    fontSize: FONT_SIZE,
  },

  cancelStyle: {
    borderRadius: BORDER_RADIUS,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: PADDING,
  },

  cancelTextStyle: {
    textAlign: 'center',
    color: '#333',
    fontSize: FONT_SIZE,
  },

  optionStyle: {
    padding: PADDING,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },

  optionTextStyle: {
    textAlign: 'center',
    fontSize: FONT_SIZE,
    color: HIGHLIGHT_COLOR,
  },

  defaultSelectStyle: {
    padding: PADDING,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },

  defaultTextStyle: {
    textAlign: 'center',
    fontSize: FONT_SIZE,
    color: '#53b737',
  },

  sectionStyle: {
    padding: PADDING * 2,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },

  sectionTextStyle: {
    textAlign: 'center',
    fontSize: FONT_SIZE,
  },
});

const customer_styles = StyleSheet.create({
  overlayStyle: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: pxToDp(90),
  },

  optionContainer: {//选项容器元素的样式定义 | 大的框样式
    borderRadius: BORDER_RADIUS,
    flexShrink: 1,
    marginBottom: 8,
    padding: PADDING,
    paddingBottom: 3,
    backgroundColor: '#fff',
    maxHeight: pxToDp(800),
  },

  cancelContainer: {
    flexGrow: 1,
    maxHeight: 30,
    alignSelf: 'stretch',
  },

  selectStyle: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: PADDING,
    borderRadius: BORDER_RADIUS,
    flex: 1,
  },

  selectTextStyle: {
    textAlign: 'center',
    color: '#333',
    fontSize: FONT_SIZE,
  },

  cancelStyle: {
    borderRadius: BORDER_RADIUS,
    padding: PADDING,
    backgroundColor: '#fff',
    height: pxToDp(80),
    marginTop: pxToDp(10),
  },

  cancelTextStyle: {
    textAlign: 'center',
    fontSize: FONT_SIZE,
    color: '#666'
  },

  optionStyle: {
    padding: PADDING,
    height: pxToDp(90),
    justifyContent: 'center',
  },

  optionTextStyle: {
    textAlign: 'center',
    fontSize: FONT_SIZE,
    color: '#666'
  },

  defaultSelectStyle: {
    padding: PADDING,
    height: pxToDp(90),
  },

  defaultTextStyle: {
    textAlignVertical: 'center',
    textAlign: 'center',
    fontSize: FONT_SIZE,
    color: 'green',
  },

  sectionStyle: {
    padding: PADDING * 2,
  },

  sectionTextStyle: {
    textAlign: 'center',
    fontSize: pxToDp(34),
    fontWeight: 'bold',
    color: '#333'
  },

  bottom_line: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

