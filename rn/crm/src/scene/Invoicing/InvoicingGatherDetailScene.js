import React, {PureComponent} from 'react';
import {ScrollView, Text, TextInput, View,} from 'react-native'
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import {Cell, CellBody, CellFooter, CellHeader, Cells,} from "../../weui/index";
import MyBtn from '../../common/myBtn'
import Config from '../../config'
import * as globalActions from '../../reducers/global/globalActions';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class InvoicingGatherDetail extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {req} =  (navigation.state.params || {});
    let storeName = req['store_name'];
    return {
      headerTitle: (<Text style={{color: colors.white}}>{storeName}</Text>),
      headerStyle: {
        backgroundColor: colors.fontBlue,
      },
    }
  };

  constructor(props: Object) {
    super(props);
  }

  componentDidMount() {

  }

  componentWillMount() {
    const {req} = (this.props.navigation.state.params || {});
    this.state = {
      reqData: req
    };
  }

  renderItems(){
    const reqData = this.state.reqData;
    let reqItems = reqData['req_items'];
    let items = reqItems.map(function (item, idx) {
      return <Cell key={idx} customStyle={{
        marginLeft: pxToDp(0),
        paddingHorizontal: pxToDp(30),
        minHeight: pxToDp(100),
      }}>
        <CellHeader style={{width: pxToDp(300)}}>
          <Text>{item['name']}</Text>
        </CellHeader>
        <CellBody/>
        <CellFooter>
          <Text style={{width: pxToDp(100), textAlign: 'center'}}>{item['total_req']}</Text>
          <View style={{
            width: pxToDp(200),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TextInput
              underlineColorAndroid='transparent'
              style={{
                backgroundColor: colors.white,
                height: pxToDp(70), width: pxToDp(110),
              }}
              placeholder='输入'
              placeholderTextColor='#ccc'
              value={item['req_amount']}
            />
            <Text>斤</Text>
          </View>
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
          />
          <Cell customStyle={{
            marginLeft: pxToDp(0),
            paddingHorizontal: pxToDp(30)
          }}
              onPress={() => {
                this.props.navigate(Config.ROUTE_INVOICING_GATHER_DETAIL);
              }}
          >
            <CellHeader style={{width: pxToDp(300)}}>
              <Text>商品名</Text>
            </CellHeader>
            <CellBody/>
            <CellFooter>
              <Text style={{width: pxToDp(100), textAlign: 'center'}}>分数</Text>
              <Text style={{width: pxToDp(200), textAlign: 'center'}}>总量</Text>
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
            <MyBtn text='订货' style={[{width: pxToDp(180), color: colors.fontBlue}, styles.bottom_btn,]}/>
            <MyBtn text='提交' style={[{
              width: pxToDp(360),
              color: colors.white,
              backgroundColor: colors.fontBlue,
            }, styles.bottom_btn,]}/>
          </View>
        </View>
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
}

export default connect(mapStateToProps, mapDispatchToProps)(InvoicingGatherDetail)