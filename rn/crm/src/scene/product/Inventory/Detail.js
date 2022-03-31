import BaseComponent from "../../common/BaseComponent";
import {connect} from "react-redux";
import React from "react";
import {StyleSheet, Text, View} from "react-native";
import LoadMore from "react-native-loadmore";
import HttpUtils from "../../../pubilc/util/http";
import pxToDp from "../../../util/pxToDp";
import color from '../../../widget/color'
import EmptyData from "../../common/component/EmptyData";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

class Detail extends BaseComponent {

  constructor(props) {
    super(props)
    this.state = {
      page: 1,
      lists: [],
      isLastPage: false,
      isLoading: false
    }
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData() {
    const {productId, storeId,} = this.props.route.params
    const uri = `/api_products/inventory_detail_history?access_token=${this.props.global.accessToken}`
    this.setState({isLoading: true})
    HttpUtils.get.bind(this.props)(uri, {productId, storeId, page: this.state.page}).then(res => {
      const lists = (this.state.page === 1 ? [] : this.state.lists).concat(res.lists)
      this.setState({isLastPage: res.isLastPage, lists: lists, isLoading: false, page: res.page + 1})
    })
  }

  onRefresh() {
    this.setState({page: 1}, () => this.fetchData())
  }

  renderList() {
    return (
        <For of={this.state.lists} each="item" index="idx">
          <View key={idx} style={styles.item}>
            <View style={styles.itemRow}>
              <Text style={styles.itemRowText}>操作时间：{item.updated} </Text>
              <If condition={item.operator_user}>
                <Text style={styles.itemRowText}>操作人：{item.operator_user.nickname} </Text>
              </If>
              <Text style={styles.itemRowText}>库存：{item.stock} </Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemRowText}>操作类型：{item.operate_type} </Text>
              <Text style={styles.itemRowText}>{item.num > 0 ? `+${item.num}` : item.num} </Text>
            </View>
            <If condition={item.remark}>
              <View style={styles.itemRow}>
                <Text style={styles.itemRowText}>备注信息：{item.remark} </Text>
              </View>
            </If>
          </View>
        </For>
    )
  }

  render() {
    return (
        <View style={{flex: 1}}>
          {this.state.lists.length ? <LoadMore
              loadMoreType={'scroll'}
              onLoadMore={() => this.fetchData()}
              bottomLoadDistance={50}
              renderList={this.renderList()}
              onRefresh={() => this.onRefresh()}
              isLastPage={this.state.isLastPage}
              isLoading={this.state.isLoading}
          /> : <EmptyData/>}
        </View>
    )
  }
}

export default connect(mapStateToProps)(Detail)

const styles = StyleSheet.create({
  item: {
    paddingHorizontal: pxToDp(20),
    backgroundColor: '#fff',
    borderBottomWidth: pxToDp(1),
    borderBottomColor: color.fontGray
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: pxToDp(10),
  },
  itemRowText: {
    fontSize: 12
  }
})
