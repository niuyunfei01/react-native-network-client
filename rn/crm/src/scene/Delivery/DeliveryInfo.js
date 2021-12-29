import React, {PureComponent} from "react";
import {Alert, InteractionManager, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import pxToDp from "../../util/pxToDp";
import HttpUtils from "../../util/http";
import {connect} from "react-redux";
import {hideModal, showModal} from "../../util/ToastUtils";
import * as globalActions from "../../reducers/global/globalActions";
import {bindActionCreators} from "redux";
import Styles from "../../themes/Styles";
import tool from "../../common/tool";
import {Cell, CellBody, CellFooter, Cells, CellsTitle, Icon} from "../../weui";
import colors from "../../styles/colors";
import {Button, Provider} from "@ant-design/react-native";
import BottomModal from "../component/BottomModal";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import config from "../../config";
import AppConfig from "../../config";
import native from "../../common/native";

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
    let delivery_id = this.props.route.params.delivery_id;
    this.state = {
      delivery_id: delivery_id,
      platform_name: "美团飞速达",
      item_list: [],
      err_msg: [],
      master_address: '',
      master_center: '',
      store_address: '',
      store_center: '',
      alert_msg: '',
      show_btn_type: 1,
      apply_status: 0,
      audit_msg: '',
      audit_time: '',
      worker_phone: '',
      showModal: false,
      platform_text: '',
      need_audit: false,
    }
  }

  UNSAFE_componentWillMount() {
    this.fetchData()
  }

  componentDidMount() {

  }

  fetchData() {
    showModal("请求中...")
    const {accessToken, currStoreId} = this.props.global
    const api = `/v1/new_api/Delivery/shop_bind_info?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(api, {store_id: currStoreId, delivery_id: this.state.delivery_id}).then((res) => {
      let show_btn_type = 0;
      if (res.has_edit_permission) {
        show_btn_type = 1
      }
      if (res.sync_info.state == 2) {
        show_btn_type = 3;
      }
      this.setState({
        platform_name: res.type_name,
        item_list: res.form,
        err_msg: res.diff_info,
        alert_msg: res.sync_info.msg,
        master_address: res.delivery_shop_location.address,
        master_center: res.delivery_shop_location.location,
        store_address: res.store_location.address,
        store_center: res.store_location.location,
        num: res.diff_meters,
        audit_msg: res.audit_msg,
        audit_time: res.audit_time,
        worker_phone: res.worker_phone,
        platform_text: res.notice,
        need_audit: res.need_audit,
        show_btn_type: show_btn_type
      })
      hideModal()
    }, () => {
      this.props.navigation.goBack()
    }).catch(() => {
      hideModal()
    })
  }

  sync_shop_info() {
    showModal("同步中...")
    const {accessToken, currStoreId} = this.props.global
    const api = `/v1/new_api/Delivery/sync_shop_info?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(api, {store_id: currStoreId, delivery_id: this.state.delivery_id}).then((res) => {
      if (!res.ok) {
        this.setState({
          apply_status: 3,
          err_msg: [res.msg],
          show_btn_type: 4,
        })
      } else {
        this.setState({
          show_btn_type: this.state.need_audit ? 4 : 5,
          apply_status: this.state.need_audit ? 1 : 2,
        })
      }

      hideModal()
    }).catch(() => {
      hideModal()
    })
  }

  onPress(route, params = {}) {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  render_item() {
    let items = []
    for (let i in this.state.item_list) {
      const item = this.state.item_list[i]
      items.push(
        <TouchableOpacity key={i} onPress={() => {
        }}>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody style={styles.cell_body}>
              <Text style={[styles.cell_body_text]}>{item.name}</Text>
            </CellBody>
            <CellFooter>
              <View style={{flexDirection: "row"}}>
                <Text onPress={() => {
                  if (item.name === '定位') {
                    let {master_address, master_center, store_address, store_center, num} = this.state;
                    master_address = encodeURI(master_address)
                    store_address = encodeURI(store_address)
                    let url = `/delivery_location_amap.html?master_center=${master_center}&master_address=${master_address}&store_address=${store_address}&store_center=${store_center}&num=${num}`
                    url = AppConfig.apiUrl(url)
                    this.onPress(config.ROUTE_WEB, {url: url})
                  }
                }}>{item.value} {item.name === '定位' ? ">" : null}</Text>
              </View>
            </CellFooter>
          </Cell>
        </TouchableOpacity>
      )
    }
    return <View>
      {items}
    </View>
  }

  rendermsg() {
    let items = []
    if (tool.length(this.state.err_msg) > 0) {
      for (let msg of this.state.err_msg) {
        items.push(<View style={[Styles.between, {marginTop: pxToDp(4), marginEnd: pxToDp(10)}]}>
          <Text style={{
            color: '#EE2626',
            fontSize: pxToDp(26)
          }}>{msg}</Text>
        </View>)
      }
      return (
        <View
          style={{
            marginLeft: pxToDp(20),
            marginRight: pxToDp(20),
            backgroundColor: colors.white,
            borderRadius: pxToDp(20)
          }}>
          <View style={{
            margin: pxToDp(10),
            marginTop: pxToDp(20),
            marginBottom: pxToDp(20),
            flexDirection: 'row',
          }}>
            <View style={{
              margin: pxToDp(6),
            }}>
              <Icon name="warn"
                    size={pxToDp(30)}
                    style={{backgroundColor: "#fff"}}
                    color={"#EE2626"}/>
            </View>
            <View style={{flex: 1}}>
              {items}
            </View>

          </View>
        </View>
      )
    } else {
      return null;
    }
  }


  renderBtn() {
    let btn = null
    if (this.state.show_btn_type === 1) {
      btn = (<Button
        type={'primary'}
        style={{
          backgroundColor: colors.main_color,
          marginHorizontal: pxToDp(30),
          borderRadius: pxToDp(20),
          textAlign: 'center',
          borderWidth: 0,
          marginBottom: pxToDp(70),
        }} onPress={() => {
        this.setState({showModal: true})
      }}>重新同步</Button>);
    } else if (this.state.show_btn_type === 2) {
      btn = (<Button
        type={'primary'}
        style={{
          backgroundColor: colors.main_color,
          marginHorizontal: pxToDp(30),
          borderRadius: pxToDp(20),
          borderWidth: 0,
          textAlign: 'center',
          marginBottom: pxToDp(70),
        }} onPress={() => {

      }}>正在同步中，查看进度</Button>);
    } else if (this.state.show_btn_type === 3) {
      btn = (<Button
        type={'primary'}
        style={{
          backgroundColor: colors.main_color,
          marginHorizontal: pxToDp(30),
          borderRadius: pxToDp(20),
          borderWidth: 0,
          textAlign: 'center',
          marginBottom: pxToDp(70),
        }} onPress={() => {
        this.setState({
          show_btn_type: 4,
          apply_status: 1,
        })

      }}>正在审核中，查看进度</Button>);
    } else if (this.state.show_btn_type === 4) {
      btn = (<Button
        type={'primary'}
        style={{
          backgroundColor: colors.main_color,
          marginHorizontal: pxToDp(30),
          borderRadius: pxToDp(20),
          textAlign: 'center',
          borderWidth: 0,
          marginBottom: pxToDp(70),
        }} onPress={() => {
        native.dialNumber(this.state.worker_phone);
      }}>联系客服</Button>);
    } else if (this.state.show_btn_type === 5) {
      btn = (<Button
        type={'primary'}
        style={{
          backgroundColor: colors.main_color,
          marginHorizontal: pxToDp(30),
          borderRadius: pxToDp(20),
          textAlign: 'center',
          borderWidth: 0,
          marginBottom: pxToDp(70),
        }} onPress={() => {
        this.setState({show_btn_type: 1, apply_status: 0})
      }}>返回</Button>);
    }
    return (<View>
      {btn}
    </View>)
  }

  renderApplyMsg() {
    return (
      <View
        style={{
          marginLeft: pxToDp(20),
          marginRight: pxToDp(20),
          marginTop: pxToDp(20),
          backgroundColor: colors.white,
          borderRadius: pxToDp(20)
        }}>
        <View style={{
          margin: pxToDp(20),
          marginTop: pxToDp(20),
          marginBottom: pxToDp(20),
        }}>
          <Text style={{fontSize: pxToDp(22), color: colors.fontBlack}}>您的修改已提交，请等待平台审核。</Text>
          <Text style={{
            fontSize: pxToDp(22),
            color: colors.fontBlack,
            marginTop: pxToDp(7)
          }}>预计完成时间：{this.state.audit_time}</Text>
          <Text style={{
            fontSize: pxToDp(22),
            color: colors.fontBlack,
            marginTop: pxToDp(15)
          }}>{this.state.platform_name}{this.state.audit_msg}</Text>
        </View>
      </View>)
  }

  renderApply() {
    let apply = null
    if (this.state.apply_status === 0) {
      return null;
    }
    if (this.state.apply_status === 1) {
      apply = (<View>
        <FontAwesome5 name={'clock'}
                      style={{
                        fontSize: pxToDp(300),
                        color: '#10AEFF',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        marginTop: pxToDp(100),
                      }}/>
        <Text style={{
          fontSize: pxToDp(80),
          color: '#10AEFF',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: pxToDp(100),
          marginBottom: pxToDp(100)
        }}>已提交申请</Text>
      </View>)
    } else if (this.state.apply_status === 2) {
      apply = (<FontAwesome5 name={'success'} style={{fontSize: pxToDp(300), color: '#10AEFF'}}/>)

      apply = (<View>
        <FontAwesome5 name={'clock'}
                      style={{
                        fontSize: pxToDp(300),
                        color: colors.main_color,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        marginTop: pxToDp(100),
                      }}/>
        <Text style={{
          fontSize: pxToDp(80),
          color: colors.main_color,
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: pxToDp(100),
          marginBottom: pxToDp(100)
        }}>同步成功</Text>
      </View>)
    } else if (this.state.apply_status === 3) {
      apply = (<View>
        <Icon name="clear" size={pxToDp(300)} style={{
          backgroundColor: "#fff",
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: pxToDp(100),
        }} color={'#FF4D4D'}/>
        <Text style={{
          fontSize: pxToDp(80),
          color: '#FF4D4D',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: pxToDp(100),
          marginBottom: pxToDp(100)
        }}>同步失败</Text>
        {this.rendermsg()}
      </View>)

    }
    return (
      <View
        style={{
          marginLeft: pxToDp(20),
          marginRight: pxToDp(20),
          marginTop: pxToDp(20),
          backgroundColor: colors.white,
          borderRadius: pxToDp(20)
        }}>
        <View style={{
          margin: pxToDp(20),
          marginTop: pxToDp(20),
          marginBottom: pxToDp(20),
        }}>
          {apply}
        </View>
      </View>)

  }

  render() {
    return (
      <Provider>
        <View style={{flex: 1}}>
          <ScrollView style={{flexGrow: 1}}>
            <If condition={this.state.apply_status === 0}>
              <CellsTitle style={styles.cell_title}>{this.state.platform_name}</CellsTitle>
              <Cells style={[styles.cell_box]}>
                {this.render_item()}
              </Cells>
            </If>
            {this.rendermsg()}

            <If condition={this.state.apply_status === 0 && tool.length(this.state.platform_text) > 0}>
              <Text
                style={{
                  marginLeft: pxToDp(35),
                  marginRight: pxToDp(35),
                  marginTop: pxToDp(20),
                  color: colors.fontBlack
                }}>{this.state.platform_text}</Text>

            </If>
            {this.renderApply()}
            <If condition={this.state.apply_status === 1}>
              {this.renderApplyMsg()}
            </If>

          </ScrollView>
          {this.renderBtn()}
          <BottomModal title={'提   示'} actionText={'确  定'}
                       btnStyle={{
                         backgroundColor: colors.main_color,
                         borderWidth: 0
                       }}
                       onPress={() => {
                         this.setState({showModal: false})
                         Alert.alert('提醒', this.state.alert_msg, [
                           {text: '取消'},
                           {
                             text: '同步', onPress: () => {
                               this.setState({
                                 show_btn_type: 2,
                               }, () => {
                                 this.sync_shop_info();
                               })

                             }
                           }
                         ])
                       }}
                       onClose={() => {
                         this.setState({showModal: false})
                       }} visible={this.state.showModal}>
            <Text style={{
              textAlign: 'center',
              marginTop: pxToDp(20),
              marginBottom: pxToDp(10)
            }}>{this.state.alert_msg}</Text>
          </BottomModal>
        </View>
      </Provider>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DeliveryInfo)
const styles = StyleSheet.create({
  cell_title: {
    marginBottom: pxToDp(5),
    fontSize: pxToDp(26),
    color: colors.color999,
  },
  cell_box: {
    margin: 10,
    paddingTop: pxToDp(5),
    paddingBottom: pxToDp(20),
    borderRadius: pxToDp(20),
    backgroundColor: colors.white,
  },
  cell_row: {
    marginRight: pxToDp(20),
    marginLeft: pxToDp(20),
    height: pxToDp(90),
    justifyContent: 'center',
    borderTopWidth: 0,
    paddingRight: pxToDp(5),
    borderBottomWidth: pxToDp(1),
  },
  cell_body: {
    paddingVertical: pxToDp(5)
  },
  cell_body_text: {
    borderWidth: 0,
    width: pxToDp(80),
    fontSize: pxToDp(26),
    color: colors.color666
  },
})
