import React from "react";
import PropType from 'prop-types'
import Dialog from "../../../common/component/Dialog";
import {connect} from "react-redux";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import color from '../../../../pubilc/styles/colors'
import pxToDp from "../../../../pubilc/util/pxToDp";
import tool from "../../../../pubilc/util/tool";
import JbbButton from "../../../common/component/JbbButton";
import config from "../../../../pubilc/common/config";
import {withNavigation} from '@react-navigation/compat';
import Mapping from "../../../../pubilc/Mapping";
import {ToastShort} from "../../../../pubilc/util/ToastUtils";

function mapStateToProps(state) {
  const {global, mine} = state;
  return {global, mine};
}

class ReceiptDetail extends React.Component {
  static propTypes = {
    item: PropType.object,
    visible: PropType.bool,
    receiptId: PropType.oneOfType([PropType.string, PropType.number]),
    onClickClose: PropType.func
  }

  constructor(props) {
    super(props)
    const user = tool.user(this.props.global, this.props.mine)
    this.state = {
      user: user,
      visible: false
    }
  }

  componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {
    this.setState({visible: nextProps.visible})
  }

  toUpdateDetail(item) {
    this.props.onClickClose()
    if (Mapping.Tools.ValueEqMapping(Mapping.Product.RECEIPT_TYPE.NONSTANDARD, item.type)) {
      this.props.navigation.navigate(config.ROUTE_INVENTORY_MATERIAL_DETAIL_UPDATE, {
        receiptDetailId: item.id
      })
    } else if (Mapping.Tools.ValueEqMapping(Mapping.Product.RECEIPT_TYPE.STANDARD, item.type)) {
      this.props.navigation.navigate(config.ROUTE_INVENTORY_STANDARD_DETAIL_UPDATE, {
        receiptDetailId: item.id
      })
    } else {
      ToastShort('未知收货类型')
    }
  }

  renderContent() {
    let items = []
    for (let idx in this.props.item.detail) {
      const item = this.props.item.detail[idx]
      items.push(
        <View key={idx} style={styles.item}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text numberOfLines={1}>
              {item.supplier.name}
            </Text>
            <View>
              <If condition={item.deleted == 1}>
                <Text style={{color: '#e94f4f'}}>(已置为无效) </Text>
              </If>
              <If condition={item.deleted == 0}>
                <TouchableOpacity onPress={() => this.toUpdateDetail(item)}>
                  <JbbButton text={'编辑'} type={'text'}/>
                </TouchableOpacity>
              </If>
            </View>

          </View>
          <Text style={{color: colors.color333}}>
            {item.type == 1 ? '重量：' : '数量：'}{item.weight}{item.type == 1 ? '公斤 | ' : '件 | '}
            {item.price}元
          </Text>
          <Text style={{color: colors.color333}}>
            收货人：{item.creator.nickname}
          </Text>
          <Text style={{color: colors.color333}}>
            收货时间：{item.created}
          </Text>
        </View>
      )
    }

    return items
  }

  render() {
    return (
      <View>
        <Dialog visible={this.state.visible} onRequestClose={() => this.props.onClickClose()}>
          {this.renderContent()}
        </Dialog>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: pxToDp(10),
    borderBottomWidth: 0.5,
    borderColor: '#eee'
  },
  add: {
    color: color.theme,
  }
})
export default withNavigation(connect(mapStateToProps)(ReceiptDetail))
