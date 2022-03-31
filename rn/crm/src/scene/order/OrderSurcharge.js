import React, {PureComponent} from 'react'
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {Accordion, WhiteSpace} from '@ant-design/react-native';
import FetchEx from "../../util/fetchEx";
import AppConfig from "../../pubilc/common/config";
import {ToastLong, ToastShort} from "../../pubilc/util/ToastUtils";
import pxToDp from "../../util/pxToDp";
import colors from "../../pubilc/styles/colors";
import tool from "../../pubilc/common/tool";
import dayjs from "dayjs";

function mapStateToProps(state) {
  const {mine, user, global} = state;
  return {mine: mine, user: user, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class OrderSurcharge extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      listData: [],
      activeSections: []
    }
  }

  UNSAFE_componentWillMount() {
    this.fetchData()
  }

  onChange = activeSections => {
    this.setState({activeSections});
  };

  fetchData() {
    const self = this
    const {global} = self.props
    const url = `api/list_store_surcharge/${global.currStoreId}?access_token=${global.accessToken}`
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          if (resp.ok) {
            self.setState({listData: resp.obj})
          } else {
            ToastShort(resp.reason)
          }
        })
        .catch(error => {
          ToastLong(error.message)
        });
  }

  renderAccordionItemStatus(status) {
    if (status == '0') {
      return (
          <Text style={style.status}>待打款</Text>
      )
    } else if (status == '1') {
      return (
          <Text style={[style.status, style.success]}>已打款</Text>
      )
    } else if (status == '10') {
      return (
          <Text style={[style.status, style.warn]}>已作废</Text>
      )
    } else if (status == '2') {
      return (
          <Text style={[style.status, style.warn]}>支付失败</Text>
      )
    } else {
      return (
          <Text style={style.status}>待打款</Text>
      )
    }
  }

  renderAccordionHeader(item) {
    return (
        <View style={{
          flexDirection: "row",
          justifyContent: 'space-between',
          width: '95%',
          height: 40,
          alignItems: 'center',
          paddingRight: '5%'
        }}>
          <Text>{dayjs(item.created).format('YY-MM-DD')} ¥{tool.toFixed(item.total_fee)} </Text>
          {this.renderAccordionItemStatus(item.status)}
        </View>
    )
  }

  renderAccordionItems() {
    const {listData} = this.state
    let items = []
    for (let i in listData) {
      let item = listData[i]
      items.push(
          <Accordion.Panel
              header={this.renderAccordionHeader(item)}
              key={i} index={i}
              style={{backgroundColor: '#fff'}}
          >
            <View style={style.detailBox}>
              <Text>订单号：{listData[i].order_id} </Text>
              <WhiteSpace/>
              <View style={{flexDirection: 'row'}}>
                <Text>状态：</Text>
                {this.renderAccordionItemStatus(item.status)}
              </View>
              <WhiteSpace/>
              <Text>金&nbsp;&nbsp;&nbsp;&nbsp;额：{tool.toFixed(listData[i].total_fee)} </Text>
              <WhiteSpace/>
              <View style={style.remarkBox}>
                <Text>备&nbsp;&nbsp;&nbsp;&nbsp;注：</Text>
                <Text style={{flex: 1}}>
                  {listData[i].remark}
                </Text>
              </View>
            </View>
          </Accordion.Panel>
      )
    }
    return items
  }

  render() {
    return (
        <ScrollView>
          <Accordion onChange={this.onChange} activeSections={this.state.activeSections}>
            {this.renderAccordionItems()}
          </Accordion>
        </ScrollView>
    )
  }
}

const style = StyleSheet.create({
  status: {
    borderWidth: pxToDp(1),
    height: pxToDp(30),
    borderRadius: pxToDp(20),
    width: pxToDp(68),
    fontSize: pxToDp(16),
    textAlign: "center",
    justifyContent: "center",
    color: colors.fontGray,
    borderColor: colors.fontGray,
    lineHeight: pxToDp(28)
  },
  success: {
    color: colors.main_color,
    borderColor: colors.main_color
  },
  warn: {
    color: colors.orange,
    borderColor: colors.orange
  },
  detailBox: {
    padding: pxToDp(40),
    backgroundColor: '#fff'
  },
  remarkBox: {
    flexDirection: 'row'
  }
})


export default connect(mapStateToProps, mapDispatchToProps)(OrderSurcharge)
