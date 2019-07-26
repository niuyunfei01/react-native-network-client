import BaseComponent from "../BaseComponent";
import {connect} from "react-redux";
import React from "react";
import {StyleSheet, Text, View} from "react-native";
import LoadMore from "react-native-loadmore";
import HttpUtils from "../../util/http";
import pxToDp from "../../util/pxToDp";
import color from '../../widget/color'
import EmptyData from "../component/EmptyData";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global}
}

class StockCheckHistory extends BaseComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '商品盘点历史'
    }
  }
  
  constructor (props) {
    super(props)
    this.state = {
      page: 1,
      lists: [],
      isLastPage: false,
      isLoading: false
    }
  }
  
  componentDidMount () {
    this.fetchData()
  }
  
  fetchData () {
    const self = this
    const {productId, storeId} = self.props.navigation.state.params
    const uri = `/api_products/inventory_check_history?access_token=${this.props.global.accessToken}`
    self.setState({isLoading: true})
    HttpUtils.get.bind(self.props)(uri, {productId, storeId}).then(res => {
      const lists = (this.state.page === 1 ? [] : this.state.lists).concat(res.lists)
      self.setState({isLastPage: res.isLastPage, lists: lists, isLoading: false, page: res.page + 1})
    })
  }
  
  onRefresh () {
    this.setState({page: 1}, () => this.fetchData())
  }
  
  renderList () {
    return (
      <For of={this.state.lists} each="item" index="idx">
        <View key={idx} style={styles.item}>
          <View style={styles.itemRow}>
            <Text style={styles.itemRowText}>盘点时间：{item.check_time}</Text>
            <Text style={styles.itemRowText}>盘点人：{item.check_user.nickname}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemRowText}>理论库存：{item.theoretical_num}</Text>
            <Text style={styles.itemRowText}>实际库存：{item.actual_num}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemRowText}>备注信息：{item.remark}</Text>
          </View>
        </View>
      </For>
    )
  }
  
  render (): React.ReactNode {
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

export default connect(mapStateToProps)(StockCheckHistory)

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