import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {
  findNodeHandle,
  FlatList,
  Modal,
  NativeModules,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewPropTypes,
} from 'react-native';

export default class Select extends Component {

  static defaultProps = {
    defaultText: 'Click To Select',
    onSelect: () => {
    },
    transparent: true,
    animationType: 'none',
    indicator: 'none',
    indicatorColor: 'black',
    indicatorSize: 10,
    indicatorIcon: null,
    selectWidth: 450,
  };

  static propTypes = {
    style: ViewPropTypes.style,
    defaultText: PropTypes.string,
    onSelect: PropTypes.func,
    textStyle: Text.propTypes.style,
    backdropStyle: ViewPropTypes.style,
    optionListStyle: ViewPropTypes.style,
    indicator: PropTypes.string,
    indicatorColor: PropTypes.string,
    indicatorSize: PropTypes.number,
    indicatorStyle: ViewPropTypes.style,
    indicatorIcon: PropTypes.element,
    itemArray: PropTypes.array,
    selectWidth: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.selected = props.selected;
    this.state = {
      modalVisible: false,
      //defaultText: props.defaultText,
      selected: props.selected,
      dy: 0,
      dx: 0,
    };
  }

  onSelect = (label, value) => {
    this.props.onSelect(value, label);
    this.setState({
      modalVisible: false,
      //defaultText: label,
    });
  }

  onClose = () => {
    this.setState({
      modalVisible: false,
    });
  }

  selectItem = (item) => {
    this.props.onSelect(item);
    this.setState({

      modalVisible: !this.state.modalVisible,

    });
  }

  _renderItem = ({item}) => {
    const {selected} = this.props
    return (
      <TouchableOpacity onPress={() => this.selectItem(item)}>
        <View style={{marginHorizontal: 5}}>
          <Text numberOfLines={1} style={selected === item.id ? styles.itemTextSelected : styles.itemText}>
            {item.name}
          </Text>
          <View style={{backgroundColor: '#ccc', height: 0.6}}/>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    const {backdropStyle, transparent, animationType, itemArray, selectWidth, defaultText, style} = this.props;
    const {modalVisible, dx, dy} = this.state

    return (
      <View style={style}>
        <TouchableOpacity ref={(ref) => this.selectView = ref} onPress={() => this.onPress(modalVisible)}>
          <View style={styles.selectBoxContent}>
            <Text style={[styles.showText, {width: selectWidth}]}>
              {defaultText}
            </Text>
          </View>
        </TouchableOpacity>
        <Modal transparent={transparent} animationType={animationType} visible={modalVisible}
               onRequestClose={() => this.onClose()}>
          <TouchableOpacity onPress={() => this.onModalPress()}>
            <View style={[styles.modalOverlay, backdropStyle, {paddingTop: dy, paddingLeft: dx}]}>
              <View style={[styles.scrollView, {width: selectWidth}]}>
                <FlatList
                  renderItem={this._renderItem}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  data={itemArray}
                  extraData={this.state}
                  removeClippedSubviews={false}
                  keyExtractor={(item, index) => index.toString()}
                />
              </View>
            </View>
          </TouchableOpacity>

        </Modal>
      </View>
    );
  }


  onPress = (modalVisible) => {
    this.setState({
      modalVisible: !modalVisible,
    });
    const handle = findNodeHandle(this.selectView);

    NativeModules.UIManager.measureInWindow(handle, (x, y, width, height) => {
      this.setState({
        dy: y + height,
        dx: x
      });
    });
  }

  onModalPress = () => {
    this.setState({
      modalVisible: false,
    });
  }

}

const styles = StyleSheet.create({
  itemText: {marginVertical: 10, color: '#FFFFFF', textAlign: 'right'},
  itemTextSelected: {marginVertical: 10, color: '#FF0000', textAlign: 'right'},
  showText: {
    fontSize: 15,
    flex: 1,
    textAlign: 'right',
    fontWeight: '400',
    color: '#333333',
  },
  scrollView: {
    height: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
    backgroundColor: '#000000',
  },
  selectBox: {
    borderWidth: 1,
    padding: 10,
    borderColor: '#ccc',
  },
  selectBoxContent: {
    alignItems: 'center',

  },
  modalOverlay: {
    flex: 1,
    borderColor: '#ccc',
  },
});
