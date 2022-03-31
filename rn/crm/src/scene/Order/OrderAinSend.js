import React, {Component} from 'react'
import {Alert, Platform, ScrollView, Text, TouchableOpacity, View} from 'react-native'
import {connect} from "react-redux";
import pxToDp from "../../util/pxToDp";
import HttpUtils from "../../util/http";
import colors from "../../styles/colors";
import {ToastLong, ToastShort} from "../../util/ToastUtils";
import Ionicons from "react-native-vector-icons/Ionicons";
import {Button} from "react-native-elements";
import {getContacts} from "../../reducers/store/storeActions";
import AntDesign from "react-native-vector-icons/AntDesign";

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}


function FetchView({navigation, onRefresh}) {
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh()
    });
    return unsubscribe;
  }, [navigation])
  return null;
}

class OrderAinSend extends Component {
  constructor(props: Object) {
    super(props);
    this.state = {
      orderId: this.props.route.params.orderId,
      storeId: this.props.route.params.storeId,
      accessToken: this.props.global.accessToken,
      workerList: [],
      worker: 0,
    };
  }

  UNSAFE_componentWillMount(): void {
    this.fetchWorker();
  }

  fetchWorker() {
    const {dispatch, global} = this.props;
    dispatch(getContacts(global.accessToken, this.state.storeId, (ok, msg, contacts) => {
      this.setState({workerList: contacts})
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
    }).then(res => {
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
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: pxToDp(20),
              paddingVertical: pxToDp(10),
              margin: pxToDp(10),
              marginVertical: 11,
            }}>
              <Text style={{fontSize: 15, fontWeight: 'bold'}}>配送人员</Text>
            </View>
            {this.renderWorkerList()}
          </View>
        </ScrollView>
        {this.renderBtn()}
      </View>
    )
  }

  renderWorkerList() {
    if (!this.state.workerList.length > 0) {
      return;
    }
    return (
      <For of={this.state.workerList} index="i" each="info">
        <TouchableOpacity style={{borderTopWidth: pxToDp(1), borderColor: colors.colorEEE}} onPress={() => {
          this.setState({
            worker: info.id
          })
        }}>
          <View style={info.id === this.state.worker ? {
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
          } : {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: pxToDp(20),
            paddingVertical: pxToDp(10),
            margin: pxToDp(10),
            marginVertical: 11,
          }}>
            <View style={{width: 20, height: 20, marginRight: pxToDp(30)}}>
              {info.id === this.state.worker ?
                <AntDesign name='checkcircle' style={{fontSize: pxToDp(35), color: colors.main_color}}/> :
                <Ionicons name={'radio-button-off-outline'}
                          style={{fontSize: pxToDp(40), color: colors.fontBlack}}/>}
            </View>
            <Text style={{
              fontSize: 14,
              lineHeight: pxToDp(42),
            }}>{info.label}-{info.mobile} </Text>
          </View>
        </TouchableOpacity>
      </For>
    )
  }

  renderBtn() {
    return (
      <Button title={'发起配送'}
              onPress={() => {
                Alert.alert('提醒', "自己送后系统将不再分配骑手，确定自己送吗?", [{
                  text: '取消'
                }, {
                  text: '确定',
                  onPress: () => {
                    Alert.alert('提醒', '取消专送和第三方配送呼叫，\n' + '\n' + '才能发【自己配送】\n' + '\n' + '确定自己配送吗？', [
                      {
                        text: '确定',
                        onPress: () => this.onTransferSelf(),
                      }, {
                        text: '取消'
                      }
                    ])
                  }
                }])

              }}
              buttonStyle={{
                marginBottom: pxToDp(40),
                marginHorizontal: pxToDp(30),
                borderRadius: pxToDp(10),
                backgroundColor: this.state.worker > 0 ? colors.main_color : colors.fontGray,
              }}
              titleStyle={{
                color: colors.white,
                fontSize: 16
              }}
      />
    )
  }
}


export default connect(mapStateToProps)(OrderAinSend)

