import React, {PureComponent} from 'react'
import {connect} from "react-redux";
import {
  Appearance,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {Button} from "react-native-elements";
import Entypo from "react-native-vector-icons/Entypo";
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import HttpUtils from "../../../pubilc/util/http";
import DateTimePicker from "react-native-modal-datetime-picker";
import tool from "../../../pubilc/util/tool";
import {TextArea} from "../../../weui";
import numeral from "numeral";
import {ToastShort} from "../../../pubilc/util/ToastUtils";

const width = Dimensions.get("window").width;

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

class SettlementPlatform extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      date: tool.fullDay(new Date().getTime()),
      settlementInfo: this.props.route.params?.info || {},
      platformMoney: '',
      remark_input_value: '',
      logList: [],
      isRefreshing: false
    }
  }

  componentDidMount() {
    this.navigationOptions()
    this.get_log()
  }

  navigationOptions = () => {
    const {navigation} = this.props
    const option = {headerRight: () => this.headerRight()}
    navigation.setOptions(option);
  }

  get_log = () => {
    const {currStoreId, accessToken} = this.props.global;
    let {date} = this.state;
    const api = `/v1/new_api/analysis/plat_income_log/${currStoreId}`
    HttpUtils.get.bind(this.props)(api, {
      access_token: accessToken,
      date: date
    }).then(log_info => {
      this.setState({
        isRefreshing: false,
        logList: log_info.lists,
        platformMoney: (log_info.settle_amount).toString(),
        remark_input_value: log_info.remark
      })
    })
  }

  submit = () => {
    const {currStoreId, accessToken} = this.props.global;
    let {date, remark_input_value, platformMoney} = this.state;
    const api = `/v1/new_api/analysis/update_plat_income/${currStoreId}`
    HttpUtils.get.bind(this.props)(api, {
      access_token: accessToken,
      store_id: currStoreId,
      date: date,
      amount: platformMoney,
      remark: remark_input_value
    }).then(log_info => {
      ToastShort('操作成功')
    })
  }

  closeModal = () => {
    this.setState({
      showModal: false,
      date: new Date()
    })
  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.get_log()
  }

  headerRight = () => {
    let {date} = this.state;
    return (
      <TouchableOpacity style={headerRightStyles.resetBind} onPress={() => this.setState({showModal: true})}>
        <Text style={headerRightStyles.text}>{date} </Text>
        <Entypo name="chevron-thin-down" style={styles.text}/>
      </TouchableOpacity>
    )
  }

  renderDatePicker = () => {
    let {showModal} = this.state;
    return (
      <DateTimePicker
        cancelTextIOS={'取消'}
        headerTextIOS={'选择日期'}
        isDarkModeEnabled={Appearance.getColorScheme() === 'dark'}
        confirmTextIOS={'确定'}
        date={new Date()}
        mode='date'
        isVisible={showModal}
        onConfirm={
          (date) => {
            this.setState({date: tool.fullDay(date.getTime()), showModal: false}, () => {
              this.navigationOptions()
              this.get_log()
            })
          }
        }
        onCancel={() => this.closeModal()}
      />
    )
  }

  renderSettlement = () => {
    let {settlementInfo, platformMoney, remark_input_value} = this.state;
    return (
      <View style={styles.InfoBox}>
        <Text style={styles.infoLabel}>{settlementInfo?.store_name} </Text>
        <View style={styles.platformBox}>
          <Text style={styles.infoLabel}>平台结算金额 </Text>
          <View style={{backgroundColor: colors.f5, borderRadius: 6}}>
            <TextInput
              underlineColorAndroid="transparent"
              style={{marginLeft: 10, height: 40, width: width * 0.4}}
              placeholderTextColor={colors.color999}
              value={platformMoney}
              keyboardType={'numeric'}
              placeholder={'请填写金额'}
              onChangeText={text => this.setState({platformMoney: text})}
            />
          </View>
          <Text style={{fontSize: 14, color: colors.color333}}>元 </Text>
        </View>
        <View style={styles.cuttingLine}/>
        <Text style={styles.infoLabel}>备注 </Text>
        <TextArea
          multiline={true}
          numberOfLines={4}
          maxLength={50}
          value={remark_input_value}
          onChange={(remark_input_value) => this.setState({remark_input_value})}
          showCounter={false}
          placeholder={'请填写备注信息'}
          placeholderTextColor={colors.color999}
          underlineColorAndroid="transparent"
          style={styles.remark}
        />
      </View>
    )
  }

  renderLog = () => {
    let {logList} = this.state;
    return (
      <View style={styles.InfoBox}>
        <If condition={logList.length > 0}>
          <For of={logList} each='info' index='index'>
            <View style={styles.logBox}>
              <Text style={styles.logTitle}>平台结算金额 {numeral(info.plat_settle / 100).format('0.00')}元 </Text>
              <Text style={styles.loger}>操作: {info.username} </Text>
            </View>
            <Text style={styles.logDesc}>修改时间: {info.create_at} </Text>
            <Text style={styles.logDesc}>备注: {info.remark} </Text>
            <If condition={index !== logList.length - 1}>
              <View style={styles.cuttingLine}/>
            </If>
          </For>
        </If>
        <If condition={logList.length === 0}>
          <Text style={styles.logTitle}>暂无变更记录！ </Text>
        </If>
      </View>
    )
  }

  renderBtn = () => {
    return (
      <View style={styles.bottomBtn}>
        <Button title={'保存'}
                onPress={() => this.submit()}
                containerStyle={{flex: 1}}
                buttonStyle={styles.btn}
                titleStyle={styles.btnTitle}
        />
      </View>
    )
  }

  render() {
    let {isRefreshing} = this.state;
    return (
      <View style={{flex: 1}}>
        <ScrollView
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => this.onHeaderRefresh()}
              tintColor="gray"
            />
          }
          style={styles.Content}>
          {this.renderSettlement()}
          <Text style={{fontSize: 14, color: colors.color999, marginTop: 10, marginLeft: width * 0.04}}>历史变更记录 </Text>
          {this.renderLog()}
        </ScrollView>
        {this.renderDatePicker()}
        {this.renderBtn()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  Content: {backgroundColor: '#F5F5F5'},
  row_fix: {flexDirection: "row", alignItems: "center"},
  InfoBox: {
    width: width * 0.94,
    marginLeft: width * 0.03,
    marginTop: pxToDp(15),
    backgroundColor: colors.white,
    borderRadius: 6,
    padding: 12
  },
  infoLabel: {fontWeight: "bold", fontSize: 16, color: colors.color333},
  platformBox: {marginTop: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center"},
  bottomBtn: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.white,
    padding: 10
  },
  remark: {
    marginBottom: 12,
    height: 100,
    fontSize: 14,
    color: colors.color333,
    backgroundColor: colors.f5,
    borderRadius: 4,
    padding: 10,
    marginTop: 10
  },
  btn: {
    backgroundColor: colors.main_color,
    borderRadius: 20
  },
  btnTitle: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 22
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.e5
  },
  cuttingLine: {
    backgroundColor: colors.e5,
    height: pxToDp(0.5),
    width: width * 0.86,
    marginVertical: 10
  },
  logBox: {flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: pxToDp(10)},
  logTitle: {fontWeight: "bold", fontSize: 14, color: colors.color333},
  loger: {fontSize: 12, color: colors.color333},
  logDesc: {fontSize: 12, color: colors.color666, marginVertical: pxToDp(10)}
});

const headerRightStyles = StyleSheet.create({
  resetBind: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 10,
    width: 100,
    padding: 10
  },
  text: {fontSize: 14, color: colors.color333}
})

export default connect(mapStateToProps)(SettlementPlatform)
