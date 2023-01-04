import React, {PureComponent} from 'react'
import {StyleSheet, Text, View, FlatList, TouchableOpacity} from 'react-native';
import {connect} from "react-redux";
import {ToastLong} from "../../pubilc/util/ToastUtils";
import pxToDp from "../../pubilc/util/pxToDp";
import colors from "../../pubilc/styles/colors";
import tool from "../../pubilc/util/tool";
import HttpUtils from "../../pubilc/util/http";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

class OrderSurcharge extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      listData: [],
      activeSections: [],
      select_order_id: ''
    }
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData() {
    const {store_id, accessToken} = this.props.global
    const url = `api/list_store_surcharge/${store_id}?access_token=${accessToken}`
    HttpUtils.get(url, {}).then(res => {
      this.setState({listData: res})
    }).catch(error => ToastLong(error.message))

  }

  renderAccordionItemStatus(status) {
    switch (parseInt(status)) {
      case 0:
        return <Text style={style.status}>待打款</Text>
      case 1:
        return <Text style={[style.status, style.success]}>已打款</Text>
      case 2:
        return <Text style={[style.status, style.warn]}>支付失败</Text>
      case 10:
        return <Text style={[style.status, style.warn]}>已作废</Text>
      default:
        return <Text style={style.status}>待打款</Text>
    }
  }

  touchItem = (order_id) => {
    const {select_order_id} = this.state
    if (select_order_id === order_id) {
      this.setState({select_order_id: ''})
      return
    }
    this.setState({select_order_id: order_id})
  }

  renderItem = ({item}) => {
    const {created, total_fee, status, order_id, remark, id} = item
    const {select_order_id} = this.state
    return (
      <>
        <TouchableOpacity style={style.itemWrap} onPress={() => this.touchItem(id)}>
          <Text style={style.text}>
            {tool.fullDay(created)} ¥{tool.toFixed(total_fee)}&nbsp;
          </Text>
          {this.renderAccordionItemStatus(status)}

        </TouchableOpacity>
        <If condition={select_order_id === id}>
          <View style={style.detailBox}>
            <View style={style.remarkBox}>
              <Text style={style.text}>订单号：</Text>
              <Text style={style.text}>{order_id} </Text>
            </View>

            <View style={style.remarkBox}>
              <Text style={style.text}>状&nbsp;&nbsp;&nbsp;&nbsp;态：</Text>
              {this.renderAccordionItemStatus(status)}
            </View>
            <View style={style.remarkBox}>
              <Text style={style.text}>
                金&nbsp;&nbsp;&nbsp;&nbsp;额：
              </Text>
              <Text style={style.text}>
                {tool.toFixed(total_fee)}&nbsp;
              </Text>
            </View>
            <View style={style.remarkBox}>
              <Text style={style.text}>备&nbsp;&nbsp;&nbsp;&nbsp;注：</Text>
              <Text style={{flex: 1}}>
                {remark}
              </Text>
            </View>
          </View>
        </If>
      </>
    )
  }

  render() {
    const {listData} = this.state
    return (
      <FlatList data={listData}
                style={style.zoneWap}
                ItemSeparatorComponent={ItemSeparatorComponent}
                renderItem={this.renderItem}
                keyExtractor={(item, index) => `${index}`}
                initialNumToRender={18}/>
    )
  }
}

const ItemSeparatorComponent = () => {
  return (
    <View style={style.line}/>
  )
}
const style = StyleSheet.create({
  line: {borderBottomWidth: 0.5, borderBottomColor: colors.e5},
  zoneWap: {
    marginHorizontal: 12,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
    marginVertical: 10,
    borderRadius: 10
  },
  text: {color: colors.color333, fontSize: 12},
  itemWrap: {flexDirection: "row", justifyContent: 'space-between', paddingVertical: 10, alignItems: 'center'},
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
    paddingVertical: 10,

  },
  remarkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4
  }
})


export default connect(mapStateToProps)(OrderSurcharge)
