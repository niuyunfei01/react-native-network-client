import React, {Component} from 'react'
import {ScrollView, Text, TouchableOpacity, View} from 'react-native'
import {orderChgStore} from '../../reducers/order/orderActions'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import colors from "../../pubilc/styles/colors";
import {hideModal, showModal, showSuccess, ToastLong} from "../../pubilc/util/ToastUtils";
import Entypo from "react-native-vector-icons/Entypo";
import {Button, Input} from "react-native-elements";
import PropTypes from "prop-types";
import Config from "../../pubilc/common/config";

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({orderChgStore}, dispatch)}
}

class OrderEditStoreScene extends Component {

  static propTypes = {
    dispatch: PropTypes.func,
    route: PropTypes.object,
  }

  constructor(props: Object) {
    super(props);
    this.state = {
      store_id: -1,
      why: '',
      store_name: '',
    };
    this._doReply = this._doReply.bind(this);
  }

  _doReply() {
    const {dispatch, global, route, navigation} = this.props;
    const {order} = (route.params || {});
    let {store_id, why} = this.state;
    if (order) {
      showModal('加载中')
      dispatch(orderChgStore(global.accessToken, order.id, store_id, order.store_id, why, (ok, msg) => {
        hideModal();
        if (ok) {
          showSuccess("订单已修改")
          navigation.goBack();
        } else {
          ToastLong(msg)
        }
      }))
    }
  }

  selectStore = (item) => {
    this.setState({
      store_id: item?.id,
      store_name: item?.name,
    })
  }

  render() {
    let {store_name} = this.state;
    return <ScrollView
      automaticallyAdjustContentInsets={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      style={{flex: 1, backgroundColor: colors.f3, paddingHorizontal: 10}}>
      <View style={{
        backgroundColor: colors.white,
        borderRadius: 8,
        marginVertical: 10,
        padding: 10,
        paddingBottom: 4,
      }}>
        <View style={{
          borderBottomWidth: 1,
          paddingBottom: 2,
          borderColor: colors.colorCCC
        }}>
          <Text style={{
            color: colors.color333,
            padding: 10,
            paddingLeft: 8,
            fontSize: 15,
            fontWeight: 'bold',
          }}>将订单转给 </Text>
        </View>
        <TouchableOpacity onPress={() => {
          this.props.navigation.navigate(Config.ROUTE_STORE_SELECT, {
            onBack: (item) => {
              this.selectStore(item)
            }
          })
        }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 8,
                            height: 50,
                            borderBottomWidth: 1,
                            borderColor: colors.colorCCC
                          }}>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
          }}>接收门店 </Text>
          <Text style={[{
            fontSize: 14,
            color: colors.color666,
            flex: 1,
            textAlign: "right",
          }]}>
            {store_name ? store_name : '去添加'}
          </Text>
          <Entypo name="chevron-thin-right" style={{
            color: colors.color999,
            fontSize: 18,
          }}/>
        </TouchableOpacity>

        <Input containerStyle={{
          marginVertical: 8,
          marginHorizontal: "4%",
          width: '92%',
          borderWidth: 1,
          borderColor: colors.fontGray,
          height: 120,
        }}
               inputContainerStyle={{
                 borderWidth: 0,
                 height: 118,
               }}
               inputStyle={{}}
               placeholder="请输入改店原因（选填）" value={this.state.why}
               onChangeText={(why) => this.setState({why})}/>
      </View>
      {this.renderBtn()}
    </ScrollView>
  }

  renderBtn() {
    return (
      <View style={{padding: 16}}>
        <Button title={'保存'}
                onPress={() => {
                  if (this.state.store_id !== -1) {
                    this._doReply()
                  } else {
                    ToastLong('请选择门店')
                  }
                }}
                buttonStyle={{
                  borderRadius: 5,
                  backgroundColor: colors.main_color,
                }}
                titleStyle={{
                  color: colors.white,
                  fontSize: 16
                }}
        />
      </View>
    )
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(OrderEditStoreScene)
