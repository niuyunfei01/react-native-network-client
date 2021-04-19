import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import CheckboxCells from "../../weui/Form/CheckboxCells";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import { NavigationActions } from '@react-navigation/compat';
import pxToDp from "../../util/pxToDp";
import Cts from "../../Cts";

function mapStateToProps(state) {
  const {product, global} = state;
  return {product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class GoodsClassifyScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    return {
      headerTitle: '门店分类',
    }
  };

  constructor(props) {
    super(props);
    const {store_categories, store_tags, vendor_id} = this.props.navigation.state.params
    console.log("store_tags:", store_tags,"vendor_id:", vendor_id)
    this.state = {
      arrData: this.toCheckBoxData(store_tags[vendor_id]),
      checked: store_categories,
    }
  }

  async setGoodsCats(checked) {
    let {state, dispatch} = this.props.navigation;
    let tag_list = this.GetCheckName(checked)
    const setParamsAction = NavigationActions.setParams({
      params: {store_categories: checked, tag_list: tag_list},
      key: state.params.nav_key
    });
    dispatch(setParamsAction);
  }

  toCheckBoxData(arr) {
    arr = arr || []
    arr.forEach((item, index) => {
      item.label = item.name
      item.value = item.id
      if (item.id == Cts.TAG_HIDE) {
        arr.splice(index, 1)
      }

    });
    return arr
  }

  GetCheckName(arr) {
    let {arrData} = this.state;
    let tag_list = []
    arrData.forEach((item) => {
      arr.forEach((ite) => {
        if (item.id == ite) {
          tag_list.push(item.name)
        }
      })
    });
    return tag_list.join(',')
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <ScrollView style={{backgroundColor: "#fff"}}>
          <CheckboxCells
            options={this.state.arrData}
            onChange={(checked) => {
              this.setState({checked: checked})
            }}
            style={{marginLeft: 0, paddingLeft: 0, backgroundColor: "#fff"}}
            value={this.state.checked}
          />
        </ScrollView>
        <TouchableOpacity
          onPress={async () => {
            await   this.setGoodsCats(this.state.checked);
            this.props.navigation.dispatch(NavigationActions.back())
          }}
        >
          <View style={styles.save_btn_box}>
            <Text style={styles.save_btn}>保存</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GoodsClassifyScene)

const styles = StyleSheet.create({
  save_btn_box: {
    height: pxToDp(100),
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

  },
  save_btn: {
    fontSize: pxToDp(30),
    color: '#fff',
    backgroundColor: "#59b26a",
    textAlign: 'center',
    width: '90%',
    paddingVertical: pxToDp(15),
    borderRadius: pxToDp(5)
  }
})