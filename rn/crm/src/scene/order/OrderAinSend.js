import React, {Component} from 'react'
import {Alert, Platform, ScrollView, Text, TouchableOpacity, StyleSheet, View} from 'react-native'
import {connect} from "react-redux";
import pxToDp from "../../pubilc/util/pxToDp";
import HttpUtils from "../../pubilc/util/http";
import colors from "../../pubilc/styles/colors";
import {ToastLong, ToastShort} from "../../pubilc/util/ToastUtils";
import Ionicons from "react-native-vector-icons/Ionicons";
import {Button} from "react-native-elements";
import {getContacts} from "../../reducers/store/storeActions";
import AntDesign from "react-native-vector-icons/AntDesign";
import {MixpanelInstance} from "../../pubilc/util/analytics";
import tool from "../../pubilc/util/tool";

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

class OrderAinSend extends Component {
  constructor(props: Object) {
    super(props);
    this.mixpanel = MixpanelInstance;
    this.mixpanel.track("我自己送");
    this.state = {
      orderId: this.props.route.params.orderId,
      storeId: this.props.route.params.storeId,
      sync_order: this.props.route.params.sync_order,
      accessToken: this.props.global.accessToken,
      workerList: [],
      worker: 0,
    };
  }

  componentDidMount() {
    this.fetchWorker();
  }

  fetchWorker() {
    const {dispatch, global} = this.props;
    dispatch(getContacts(global.accessToken, this.state.storeId, (ok, msg, contacts) => {
      this.setState({workerList: contacts || []})
    }));
  }


  onTransferSelf() {
    if (!this.state.worker > 0) {
      ToastLong('请选择员工');
      return;
    }
    const api = `/api/order_transfer_self?access_token=${this.state.accessToken}`
    HttpUtils.get.bind(this.props.navigation)(api, {
      orderId: this.state.orderId,
      userId: this.state.worker,
      sync_order: this.state.sync_order
    }).then(() => {
      ToastShort('操作成功');
      this.props.route.params.onBack && this.props.route.params.onBack(1);
      this.props.navigation.goBack()
    })
  }


  render() {
    return (
      <View style={{flexGrow: 1}}>
        <ScrollView style={{flex: 1, padding: pxToDp(20)}}>
          <View style={{backgroundColor: colors.white, borderRadius: pxToDp(15)}}>
            <View style={styles.header}>
              <Text style={{fontSize: 15, fontWeight: 'bold'}}>配送人员</Text>
            </View>
            {this.renderWorkerList()}
          </View>
        </ScrollView>
        {this.renderBtn()}
      </View>
    )
  }

  selectWorker = (info) => {
    this.setState({
      worker: info.id
    })
  }

  renderWorkerList() {
    if (!tool.length(this.state.workerList) > 0) {
      return;
    }
    return (
      <For of={this.state.workerList} index="i" each="info">
        <TouchableOpacity key={i}
                          style={{borderTopWidth: pxToDp(1), borderColor: colors.colorEEE}}
                          onPress={() => this.selectWorker(info)}>
          <View style={info.id === this.state.worker ? styles.isWorker : styles.notWorker}>
            <View style={{width: 20, height: 20, marginRight: pxToDp(30)}}>
              {info.id === this.state.worker ?
                <AntDesign name='checkcircle' size={18} color={colors.main_color}/> :
                <Ionicons name={'radio-button-off-outline'} size={20} color={colors.fontBlack}/>}
            </View>
            <Text style={{fontSize: 14, lineHeight: pxToDp(42)}}>
              {info.label}-{info.mobile}
            </Text>
          </View>
        </TouchableOpacity>
      </For>
    )
  }

  clickOk = () => {
    Alert.alert('提醒', '取消专送和第三方配送呼叫，\n' + '\n' + '才能发【自己配送】\n' + '\n' + '确定自己配送吗？',
      [
        {
          text: '确定',
          onPress: this.onTransferSelf
        },
        {
          text: '取消'
        }
      ])
  }

  clickAliSend = () => {
    Alert.alert('提醒', "自己送后系统将不再分配骑手，确定自己送吗?",
      [
        {
          text: '取消'
        },
        {
          text: '确定',
          onPress: this.clickOk
        }
      ])
  }

  renderBtn() {
    return (
      <Button title={'发起配送'}
              onPress={this.clickAliSend}
              buttonStyle={[{backgroundColor: this.state.worker > 0 ? colors.main_color : colors.fontGray}, styles.aLiSendBtn]}
              titleStyle={styles.styles}
      />
    )
  }
}


export default connect(mapStateToProps)(OrderAinSend)

const styles = StyleSheet.create({
  title: {
    color: colors.white,
    fontSize: 16
  },
  aLiSendBtn: {
    marginBottom: pxToDp(40),
    marginHorizontal: pxToDp(30),
    borderRadius: pxToDp(10),
  },
  notWorker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: pxToDp(20),
    paddingVertical: pxToDp(10),
    margin: pxToDp(10),
    marginVertical: 11,
  },
  isWorker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Platform.OS === 'ios' ? pxToDp(15) : pxToDp(20),
    borderColor: colors.main_color,
    backgroundColor: '#B2EAD7',
    opacity: 0.7,
    borderWidth: pxToDp(1),
    paddingHorizontal: pxToDp(20),
    margin: pxToDp(10),
    paddingVertical: pxToDp(10),
    marginVertical: 11,
  },
  header:{
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: pxToDp(20),
    paddingVertical: pxToDp(10),
    margin: pxToDp(10),
    marginVertical: 11,
  }
})
