import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  TouchableHighlight,
} from 'react-native';
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Label,
} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import DateTimePicker from 'react-native-modal-datetime-picker';

import Config from "../../config";
import tool from '../../common/tool';
import Cts from '../../Cts';
import {ToastLong} from "../../util/ToastUtils";
import {Toast, Icon} from "../../weui/index";
import BottomBtn from './ActivityBottomBtn';

function mapStateToProps(state) {
  const {mine, global, activity} = state;
  return {mine: mine, global: global, activity: activity}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class ActivityEditRuleScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '修改加价阶梯',
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      rule: []
    }
  }

  componentWillMount() {
    let {rule} = this.props.navigation.state.params;
    this.setState({rule: rule})
  }
  renderList() {
    let {rule} = this.state;
    let length = rule.length
    return rule.map((item, index) => {
      let {min_price, max_price} = item;
      return (
          <View style={style.edit_cell} key={index}>
            <Text style={style.start}>{min_price}元</Text>
            <Text style={style.zhi}>至</Text>
            <TextInput
                style={style.max_price}
                underlineColorAndroid='transparent'
                keyboardType='numeric'
                value={max_price == Cts.Rule_PRICE_UPPER ? '' : `${max_price}`}
                onChangeText={(text) => {
                  item.max_price = text;
                  if (index == length - 1) {
                    rule.push({
                      min_price: text,
                      max_price: '',
                    })
                    this.forceUpdate()
                  } else {
                    rule[index + 1].min_price = text;
                    this.forceUpdate()
                  }
                }}
                onEndEditing={(event) => {
                  let text = event.nativeEvent.text;
                  if (parseInt(min_price) > text) {
                    ToastLong('请重新调整区间!')
                  }
                }}
            />
            <Text style={[style.zhi, {width: pxToDp(70), textAlign: 'center'}]}>元</Text>
            <View style={style.delete}>
              <TouchableOpacity
                  onPress={() => {
                    rule[index + 1].min_price = rule[index - 1].max_price;
                    rule.splice(index, 1);
                    this.forceUpdate()
                  }}
              >
                {
                  index == 0 || index == (rule.length - 1) ? null :
                      <Icon
                          name={'clear'}
                          size={pxToDp(40)}
                          style={{backgroundColor: '#fff'}}
                          color={'#d81e06'}
                          msg={false}
                      />
                }
              </TouchableOpacity>
              {/*{*/}
              {/*this.renderDelete(index)*/}
              {/*}*/}
            </View>
          </View>
      )
    })
  }

  render() {
    return (
        <View style={{flex: 1}}>
          <ScrollView>
            {this.renderList()}
            <TouchableOpacity
                onPress={() => {

                }}
            >
              <BottomBtn/>
            </TouchableOpacity>
          </ScrollView>
        </View>
    )
  }
}

const style = StyleSheet.create({
  edit_cell: {
    height: pxToDp(135),
    backgroundColor: colors.white,
    paddingHorizontal: pxToDp(30),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: pxToDp(1),
  },
  start: {
    width: pxToDp(200),
    fontSize: pxToDp(32),
    color: colors.fontBlack,
  },
  zhi: {
    width: pxToDp(100),
  },
  style_input: {
    width: pxToDp(150),
    height: pxToDp(65),
    borderColor: colors.main_color,
    textAlign: 'center',
    borderRadius: pxToDp(5),
    borderWidth: pxToDp(1),
  },
  delete: {
    width: pxToDp(140),
    alignItems: 'center',
  },
  max_price: {
    borderWidth: pxToDp(1),
    borderColor: colors.main_color,
    textAlign: 'center',
    width: pxToDp(160),
    height: pxToDp(65)
  }
});
export default connect(mapStateToProps, mapDispatchToProps)(ActivityEditRuleScene)
