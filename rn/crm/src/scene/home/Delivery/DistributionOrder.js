import React, {PureComponent} from "react";
import {Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import pxToDp from "../../../util/pxToDp";
import HttpUtils from "../../../pubilc/util/http";
import {connect} from "react-redux";
import * as globalActions from "../../../reducers/global/globalActions";
import {bindActionCreators} from "redux";
import tool from "../../../pubilc/common/tool";
import SearchStore from "../../../pubilc/component/SearchStore";
import {ToastLong} from "../../../pubilc/util/ToastUtils";

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global};
}

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}

class DeliveryInfo extends PureComponent {
  constructor(props) {
    super(props)
    let ext_store_id = this.props.route.params.ext_store_id
    this.state = {
      show_body: true, searchStoreVisible: false, ext_store_id: ext_store_id

    }
    this.get_map_store();
  }


  onCanChangeStore(store_id) {
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    let {currVendorId} = tool.vendor(this.props.global);
    const vendorId = currVendorId
    const api = `/v1/new_api/ext_stores/add_map_store_id_list/?access_token=${accessToken}&vendorId=${vendorId}`
    HttpUtils.post.bind(this.props)(api, {
      ext_store_id: this.state.ext_store_id, map_store_id: store_id
    }).then(res => {
      ToastLong('添加成功')
      this.get_map_store();
    }).catch((reason) => {
      ToastLong(reason)
    })
  }

  get_map_store() {
    var that = this;
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    let {currVendorId} = tool.vendor(this.props.global);
    const vendorId = currVendorId
    const api = `/v1/new_api/ext_stores/get_map_store_id_list/${this.state.ext_store_id}/?access_token=${accessToken}&vendorId=${vendorId}`
    HttpUtils.get.bind(this.props)(api).then(res => {
      that.setState({
        business_status: res
      })
    }).catch((reason) => {
      ToastLong(reason)
    })
  }

  deleFn(map_store_id) {
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    let {currVendorId} = tool.vendor(this.props.global);
    const vendorId = currVendorId
    const api = `/v1/new_api/ext_stores/delete_from_map_store_id_list/?access_token=${accessToken}&vendorId=${vendorId}`
    HttpUtils.post.bind(this.props)(api, {
      ext_store_id: this.state.ext_store_id, map_store_id: map_store_id
    }).then(res => {
      ToastLong('删除成功')
      this.get_map_store();
    }).catch((reason) => {
      ToastLong(reason)
    })
  }


  renderBody() {
    const business_status = this.state.business_status
    const store_id = this.props.global.currStoreId
    const vendor_id = this.props.global.config.vendor.id
    let items = []
    for (let i in business_status) {
      items.push(<View style={styles.shopItem}>
        <View style={styles.shopItemleft}><Text>{business_status[i].name} </Text></View>
        <TouchableOpacity style={styles.shopItemright}
                          onPress={() => {
                            Alert.alert('确认删除', '删除就近分配订单门店，将无法收到该门店的订单', [{
                              text: '取消'
                            }, {
                              text: '确定',
                              onPress: () => {
                                // map_store_id
                                this.deleFn(business_status[i].id)
                              }
                            }])
                          }}>
          <Text style={styles.shopItemrightText}>删除</Text>
        </TouchableOpacity>
      </View>)
    }
    return (<View>
          <ScrollView style={styles.bodyContainer}>
            {items}
          </ScrollView>

          <SearchStore visible={this.state.searchStoreVisible}
                       onClose={() => this.setState({searchStoreVisible: false})}
                       onSelect={(item) => {
                         this.onCanChangeStore(item.id);
                         this.setState({searchStoreVisible: false})
                       }}/>

        </View>

    )
  }

  render() {
    return (<View style={{flex: 1}}>

          {this.renderBody()}
          <TouchableOpacity style={styles.footerContainer}
                            onPress={() => {
                              this.setState({searchStoreVisible: true})
                            }}>
            <View style={[styles.footerBtn]}>
              <Text style={styles.footerBtnText}>添加门店</Text>
            </View>
          </TouchableOpacity>

        </View>


    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DeliveryInfo)
const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: 'row', height: pxToDp(80), width: '80%', margin: '10%',
  }, footerBtn: {
    alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%', backgroundColor: '#59b26a'
  }, title: {
    width: '100%', marginTop: pxToDp(30), alignItems: 'center',
  }, shopitem: {
    flexDirection: 'row', padding: pxToDp(30)
  }, shoplabel: {
    width: '80%',

  }, footerBtnText: {
    color: 'white',
  }, shopItem: {
    padding: pxToDp(40),
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: pxToDp(2),
    borderBottomColor: '#cccccc',

  }, shopItemleft: {
    flex: 8
  }, shopItemright: {
    flex: 1,

  }, shopItemrightText: {
    color: 'red'
  }
})
