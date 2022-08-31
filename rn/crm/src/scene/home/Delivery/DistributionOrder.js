import React, {PureComponent} from "react";
import {Alert, InteractionManager, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import pxToDp from "../../../pubilc/util/pxToDp";
import HttpUtils from "../../../pubilc/util/http";
import {connect} from "react-redux";
import * as globalActions from "../../../reducers/global/globalActions";
import {bindActionCreators} from "redux";
import tool from "../../../pubilc/util/tool";
import {ToastLong} from "../../../pubilc/util/ToastUtils";
import colors from "../../../pubilc/styles/colors";
import Config from "../../../pubilc/common/config";

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global};
}

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}

class DistributionOrder extends PureComponent {
  constructor(props) {
    super(props)
    let ext_store_id = this.props.route.params.ext_store_id
    const {accessToken} = this.props.global;
    let {currVendorId} = tool.vendor(this.props.global);
    this.state = {
      show_body: true,
      ext_store_id: ext_store_id,
      accessToken: accessToken,
      currVendorId: currVendorId
    }
    this.get_map_store();
  }

  onPress = (route, params = {}) => {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  onCanChangeStore = (store_id) => {
    let {accessToken, currVendorId} = this.state
    const api = `/v1/new_api/ext_stores/add_map_store_id_list/?access_token=${accessToken}&vendorId=${currVendorId}`
    HttpUtils.post.bind(this.props)(api, {
      ext_store_id: this.state.ext_store_id, map_store_id: store_id
    }).then(res => {
      ToastLong('添加成功')
      this.get_map_store();
    }).catch((reason) => {
      ToastLong(reason)
    })
  }

  get_map_store = () => {
    let {accessToken, currVendorId, ext_store_id} = this.state
    const api = `/v1/new_api/ext_stores/get_map_store_id_list/${ext_store_id}/?access_token=${accessToken}&vendorId=${currVendorId}`
    HttpUtils.get.bind(this.props)(api).then(res => {
      this.setState({
        business_status: res
      })
    }).catch((reason) => {
      ToastLong(reason)
    })
  }

  deleFn = (map_store_id) => {
    let {accessToken, currVendorId, ext_store_id} = this.state
    const api = `/v1/new_api/ext_stores/delete_from_map_store_id_list/?access_token=${accessToken}&vendorId=${currVendorId}`
    HttpUtils.post.bind(this.props)(api, {
      ext_store_id: ext_store_id, map_store_id: map_store_id
    }).then(res => {
      ToastLong('删除成功')
      this.get_map_store();
    }).catch((reason) => {
      ToastLong(reason)
    })
  }

  renderBody = () => {
    let {business_status} = this.state
    let items = []
    for (let i in business_status) {
      items.push(<View style={styles.shopItem}>
        <View style={styles.shopItemleft}>
          <Text style={{color: colors.color333}}>{business_status[i].name} </Text>
        </View>
        <TouchableOpacity style={styles.shopItemright}
                          onPress={() => {
                            Alert.alert('确认删除', '删除就近分配订单门店，将无法收到该门店的订单', [{
                              text: '取消'
                            }, {
                              text: '确定',
                              onPress: () => {
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
      </View>
    )
  }

  render() {
    return (<View style={{flex: 1}}>
        {this.renderBody()}
        <TouchableOpacity style={styles.footerContainer} onPress={() => {
          this.onPress(Config.ROUTE_STORE_SELECT, {
            onBack: (item) => {
              this.onCanChangeStore(item.id);
            }
          })
        }}>
          <View style={[styles.footerBtn]}>
            <Text style={styles.footerBtnText}>添加门店 </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DistributionOrder)

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
