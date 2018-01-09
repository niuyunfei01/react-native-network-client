import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
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
import {getVendorStores} from "../../reducers/mine/mineActions";
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import Config from "../../config";
import {uploadImg, newProductSave} from "../../reducers/product/productActions";
import tool from '../../common/tool';
import Cts from '../../Cts';
import {NavigationItem} from '../../widget';
import native from "../../common/native";
import {ToastLong} from "../../util/ToastUtils";
import {NavigationActions} from "react-navigation";
import {Toast, Dialog, Icon, Button} from "../../weui/index";
import Header from './OperateHeader';
import OperateIncomeItem from './OperateIncomeItem'

function mapStateToProps(state) {
  const {mine, product, global} = state;
  return {mine: mine, product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      uploadImg,
      newProductSave,
      ...globalActions
    }, dispatch)
  }
}

class OperateIncomeDetailScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '收入详情',
    };
  };

  constructor(props) {
    super(props);
    // let {currVendorId} = tool.vendor(this.props.global);
    // let currStoreId = this.props.navigation.state.params.store_id
    this.state = {
      tabNum: 2
    };
    this.tab = this.tab.bind(this)
  }

  componentWillMount() {
    let {type} = this.props.navigation.state.params;
    console.log('type>>>>>>',type);
    this.setState({tabNum: type})
  }
  tab(num) {
    this.setState({tabNum: num})
  }

  renderContent() {
    let {tabNum} = this.state;
    if (tabNum == 1) {
      return (
          <Cells style={{marginLeft: 0}}>
            <Cell access
                  style={styles.cell}
            >
              <CellHeader>
                <Text style={styles.cell_name}>#11(饿了么)</Text>
              </CellHeader>
              <CellBody style={{justifyContent: 'center'}}>
                <Text style={styles.cell_num}>21件商品</Text>
              </CellBody>
              <CellFooter>
                <Text style={styles.cell_money}>1716.89</Text>
              </CellFooter>
            </Cell>
          </Cells>
      )
    } else {
      return (
          <View style={{marginTop: pxToDp(20)}}>
            <OperateIncomeItem/>
            <Button type={'primary'} style={{marginHorizontal: pxToDp(30), marginTop: pxToDp(160),marginBottom:pxToDp(30)}}>
              添加新收入
            </Button>
          </View>
      )
    }
  }

  render() {
    return (
        <View style={{flex: 1}}>
          <View style={tab.wrapper}>
            <TouchableOpacity
                onPress={() => {
                  this.tab(1)
                }}
            >
              <Text style={this.state.tabNum == 1 ? [tab.text, tab.active] : [tab.text]}>订单明细</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => {
                  this.tab(2)
                }}
            >
              <Text
                  style={this.state.tabNum == 2 ? [tab.text, tab.right, tab.active] : [tab.right, tab.text]}>其他收入</Text>
            </TouchableOpacity>
          </View>
          <Header text={'今日订单总收入'} money={61716.89}/>
          <ScrollView>
            {
              this.renderContent()
            }
          </ScrollView>
        </View>
    )
  }
}

const tab = StyleSheet.create({
  wrapper: {
    height: pxToDp(100),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontSize: pxToDp(32),
    color: colors.fontGray

  },
  right: {
    marginLeft: pxToDp(110)
  },
  active: {
    color: colors.main_color
  }
});
const styles = StyleSheet.create({
  cell: {
    height: pxToDp(100),
    flexDirection: 'row',
    alignItems: 'center'

  },
  cell_name: {
    fontSize: pxToDp(30),
    color: '#3e3e3e'
  },
  cell_num: {
    fontSize: pxToDp(24),
    color: '#bebebe',
    lineHeight: pxToDp(35)
  },
  cell_money: {
    fontSize: pxToDp(36)
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(OperateIncomeDetailScene)
