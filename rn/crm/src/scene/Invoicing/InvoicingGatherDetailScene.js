import React, {PureComponent} from 'react';
import {ScrollView, Text, TextInput, View,} from 'react-native'
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import {Cell, CellBody, CellFooter, CellHeader, Cells, Select} from "../../weui/index";
import MyBtn from '../../common/MyBtn'
import Config from '../../config'
import * as globalActions from '../../reducers/global/globalActions';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import native from "../../common/native";
import SelectDialog from "../../common/SelectDialog"
import {editUnlockedItems, editUnlockedReq} from "../../reducers/invoicing/invoicingActions";

const SkuUnitSelect = [
  {txt: '斤', id: '0'},
  {txt: '份', id: '1'},
];

const SkuUnitMap = {
  '0': '斤',
  '1': '份'
};

function mapStateToProps(state) {
  const {invoicing, global} = state;
  return {invoicing: invoicing, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      editUnlockedItems,
      editUnlockedReq,
      ...globalActions
    }, dispatch)
  }
}

class InvoicingGatherDetailScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {req} = (navigation.state.params || {});
    let storeName = req['store_name'];
    return {
      headerTitle: (<Text style={{color: colors.white}}>{storeName}</Text>),
      headerStyle: {
        backgroundColor: colors.fontBlue,
      },
    }
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  componentWillMount() {
    const {req} = (this.props.navigation.state.params || {});
    this.state = {
      reqData: req,
    };
  }

  doUpdateItems(key, val, id) {
    let reqData = this.state.reqData;
    const {dispatch} = this.props;
    dispatch(editUnlockedItems(reqData['id'], id, key, val));
  }

  handleChangeReqRemark(text) {
    let reqData = this.state.reqData;
    const {dispatch} = this.props;
    dispatch(editUnlockedReq(reqData['id'], text));
  }

  handleChangeUnitType(value, selectedItem, id) {
    this.doUpdateItems('unit_type', selectedItem['id'], id);
  }

  handleChangeItemReqCount(val, id) {
    this.doUpdateItems('total_req', val, id);
  }

  handleChangeItemReqAmount(val, id) {
    this.doUpdateItems('req_amount', val, id);
  }

  showSelectUnitType(item) {
    this.refs.skuUnitType.show(item['id'])
  }

  renderItems() {
    const reqData = this.state.reqData;
    let reqItems = reqData['req_items'];
    let _self = this;
    let items = reqItems.map(function (item, idx) {
      return <Cell key={idx} customStyle={{
        marginLeft: pxToDp(0),
        paddingHorizontal: pxToDp(30),
        minHeight: pxToDp(100),
      }} access={true}>
        <CellHeader style={{width: pxToDp(300)}}>
          <Text>{item['name']}</Text>
        </CellHeader>
        <CellBody/>
        <CellFooter>
          <TextInput
            underlineColorAndroid='transparent'
            keyboardType='numeric'
            style={{
              backgroundColor: colors.white,
              height: pxToDp(70), width: pxToDp(130),
            }}
            placeholder='输入'
            placeholderTextColor='#ccc'
            onChangeText={(text) => _self.handleChangeItemReqCount(text, item['id'])}
            value={item['total_req']}/>
          <TextInput
            underlineColorAndroid='transparent'
            keyboardType='numeric'
            style={{
              backgroundColor: colors.white,
              height: pxToDp(70), width: pxToDp(140),
            }}
            placeholder='输入'
            placeholderTextColor='#ccc'
            value={item['req_amount']}
            onChangeText={(text) => _self.handleChangeItemReqAmount(text, item['id'])}
          />
          <Text style={{textAlign: 'center'}}
                onPress={() => _self.showSelectUnitType(item)}>{SkuUnitMap[item['unit_type']]}</Text>
        </CellFooter>
      </Cell>
    });
    return items;
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <ScrollView>
          <TextInput
            underlineColorAndroid='transparent'
            style={{backgroundColor: colors.white, height: pxToDp(200)}}
            placeholder='输入备注信息'
            placeholderTextColor='#ccc'
            value={this.state.reqData.remark}
            onChangeText={(text) => this.handleChangeReqRemark(text)}
          />
          <Cell customStyle={{
            marginLeft: pxToDp(0),
            paddingHorizontal: pxToDp(30)
          }}
                onPress={() => {
                  this.props.navigate(Config.ROUTE_INVOICING);
                }}
          >
            <CellHeader style={{width: pxToDp(300)}}>
              <Text>商品名</Text>
            </CellHeader>
            <CellBody/>
            <CellFooter>
              <Text style={{width: pxToDp(130), textAlign: 'center'}}>份数</Text>
              <Text style={{width: pxToDp(130), textAlign: 'center'}}>总量</Text>
              <Text style={{width: pxToDp(100), textAlign: 'center'}}>单位</Text>
            </CellFooter>
          </Cell>
          <Cells>
            {this.renderItems()}
          </Cells>
        </ScrollView>
        <View style={{
          flexDirection: 'row',
          position: 'absolute',
          width: '100%',
          bottom: 0,
          left: 0,
          backgroundColor: colors.white
        }}>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <MyBtn text='打印' style={[{width: pxToDp(180), color: colors.fontBlue}, styles.bottom_btn,]}/>
            <MyBtn text='订货' style={[{width: pxToDp(180), color: colors.fontBlue}, styles.bottom_btn,]}
                   onPress={() => native.toGoods()}/>
            <MyBtn text='提交' style={[{
              width: pxToDp(360),
              color: colors.white,
              backgroundColor: colors.fontBlue,
            }, styles.bottom_btn,]}/>
          </View>
        </View>
        <SelectDialog
          innersWidth={140}
          innersHeight={160}
          ref="skuUnitType"
          titles={'请选择单位'}
          valueChange={(item, index, dialogKey) => this.handleChangeUnitType.bind(this)}
          datas={SkuUnitSelect}
          animateType={'fade'}
        />
      </View>
    )
  }
}

const styles = {
  bottom_btn: {
    textAlign: 'center',
    height: pxToDp(100),
    textAlignVertical: 'center'
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(InvoicingGatherDetailScene)