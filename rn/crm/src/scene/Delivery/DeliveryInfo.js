import React, {PureComponent} from "react";
import {ScrollView, StyleSheet, Text, View} from 'react-native'
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
    this.state = {
      platform_name: "美团飞速达",
      item_list: [
        {'label': '编号', "value": '133567', "type": "id"},
        {'label': '名称', "value": '菜大全-五一生鲜市场', "type": "name"},
        {'label': '定位', "value": '查看', "type": "localtion"},
        {'label': '地址', "value": '长沙市天心区新时空大厦1层1503', "type": "address"},
        {'label': '电话', "value": '17311264645', "type": "mobile"},
        {'label': '配送时间', "value": '零售>生鲜', "type": "6:00-24:00"},
      ],
      err_msg: [
        '1.阿里旗下开放即时配送平台',
        '1.阿里旗下开放即时配送平台',
        '1.阿里旗下开放即时配送平台',
        '1.阿里旗下开放即时配送平台',
        '2.坐标与门店相差3200米'
      ],
      bottom: "您的账号类型不支持自行修改门店信息，若以上信息错误影响发单，请联系配送平台进行修改。",
      master_address: '',
      master_center: '',
      store_address: '',
      store_center: '',
      show_btn_type: 1,
      showModal: false,
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
    const api = `/api/get_store_business_status/${currStoreId}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api, {}).then((res) => {
      console.log(res, 'res')
      this.setState({
        platform_delivery_list: res.business_status,
        master_delivery_list: res.business_status
      })
      hideModal()
    }).catch(() => {
      hideModal()
    })
  }

  render_item() {
    let items = []
    for (let i in this.state.item_list) {
      const item = this.state.item_list[i]
      items.push(
        <Cell customStyle={[styles.cell_row]}>
          <CellBody style={styles.cell_body}>
            <Text style={[styles.cell_body_text]}>{item.label}</Text>
          </CellBody>
          <CellFooter>
            <View style={{flexDirection: "row"}}>
              <Text>{item.value} {item.label === '定位' ? ">" : null}</Text>

            </View>
          </CellFooter>
        </Cell>
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
        }} onPress={this.submit}>正在同步中，查看进度</Button>);
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
        }} onPress={this.submit}>正在审核中，查看进度</Button>);
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
        }} onPress={this.submit}>联系客服</Button>);
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
        <FontAwesome5 name={'clock'} style={{fontSize: pxToDp(100), color: '#10AEFF'}}/>
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
          }}>预计完成时间：一个工作日</Text>
          <Text style={{
            fontSize: pxToDp(22),
            color: colors.fontBlack,
            marginTop: pxToDp(15)
          }}>美团快速达平台需要等待平台审核，审核完成后将自动生效。</Text>
        </View>

      </View>)
  }

  render() {
    return (
      <Provider>

        <View style={{flex: 1}}>
          <ScrollView style={{flexGrow: 1}}>
            <CellsTitle style={styles.cell_title}>{this.state.platform_name}</CellsTitle>
            <Cells style={[styles.cell_box]}>
              {this.render_item()}
            </Cells>
            {this.rendermsg()}

            {this.renderApplyMsg()}
          </ScrollView>
          {this.renderBtn()}
          <BottomModal title={'提   示'} actionText={'确  定'}
                       btnStyle={{
                         backgroundColor: colors.main_color,
                         borderWidth: 0
                       }}
                       onPress={() => {
                         console.log(1)
                         this.setState({showModal: false})
                       }}
                       onClose={() => {
                         this.setState({showModal: false})
                       }} visible={this.state.showModal}>
            <Text style={{textAlign: 'center', marginTop: pxToDp(20), marginBottom: pxToDp(10)}}>您确定要重新同步信息吗？</Text>
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
    fontSize: pxToDp(26),
    color: colors.color666
  },
})
