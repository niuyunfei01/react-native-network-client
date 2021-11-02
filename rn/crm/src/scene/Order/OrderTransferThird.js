import React, {Component} from 'react'
import {ScrollView, StyleSheet, Text, View} from 'react-native'
import {Checkbox, List, Toast, WhiteSpace} from '@ant-design/react-native';
import {connect} from "react-redux";
import color from "../../widget/color";
import pxToDp from "../../util/pxToDp";
import JbbButton from "../component/JbbButton";
import HttpUtils from "../../util/http";
import EmptyData from "../component/EmptyData";
import {Styles} from "../../themes";
import colors from "../../styles/colors";

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

const CheckboxItem = Checkbox.CheckboxItem;

class OrderTransferThird extends Component {

  navigationOptions = ({navigation}) => navigation.setOptions({
    headerTitle: '发第三方配送',
  });

  constructor(props: Object) {
    super(props);
    this.state = {
      selected: this.props.route.params.selectedWay,
      newSelected: [],
      orderId: this.props.route.params.orderId,
      storeId: this.props.route.params.storeId,
      accessToken: this.props.global.accessToken,
      logistics: []
    };

    this.navigationOptions(this.props)
  }

 UNSAFE_componentWillMount (): void {
    this.fetchThirdWays()
  }

  fetchThirdWays () {
    const self = this;
    const api = `/api/order_third_logistic_ways/${this.state.orderId}?access_token=${this.state.accessToken}`;
    HttpUtils.get.bind(self.props.navigation)(api).then(res => {
      self.setState({logistics: res})
        console.log('/api/order_third_logistic_ways/', res)
    })
  }

  onCallThirdShip () {
    const self = this;
    const api = `/api/order_transfer_third?access_token=${this.state.accessToken}`;
    const {orderId, storeId, newSelected} = this.state;
    HttpUtils.post.bind(self.props.navigation)(api, {
      orderId: orderId,
      storeId: storeId,
      logisticCode: newSelected
    }).then(res => {
      Toast.success('正在呼叫第三方配送，请稍等');
      console.log('navigation params => ', this.props.route.params)
      console.log("call third ship", res);
      self.props.route.params.onBack && self.props.route.params.onBack(res);
      self.props.navigation.goBack()
    })
  }

  onSelectLogistic (code) {
    let selected = this.state.newSelected;
    let index = selected.indexOf(code);
    if (index >= 0) {
      selected.splice(index, 1)
    } else {
      selected.push(code)
    }
    console.log(selected);
    this.setState({newSelected: selected})
  }

  renderHeader () {
    return (
      <View style={styles.header}>
        <Text style={{color: '#000'}}>发第三方配送并保留专送</Text>
        <Text style={{color: color.fontGray}}>一方先接单后，另一方会被取消</Text>
      </View>
    )
  }

  renderLogistics () {
    const {logistics, selected} = this.state;
      const footerEnd = {borderBottomWidth: 1, borderBottomColor: colors.back_color, height: 56, paddingEnd: 16, alignItems: 'flex-end'};
      return (
      <List renderHeader={() => '选择配送方式'}>
        {logistics.map((i, index) => (<View style={[Styles.between]}><View style={{flex: 1,height: 58}}>
                <CheckboxItem key={i.logisticCode}  style={{borderBottomWidth: 0, borderWidth: 0, border_color_base: '#fff'}} checkboxStyle={{color: '#979797'}}
                              onChange={() => this.onSelectLogistic(i.logisticCode)}
                              disabled={selected.includes(String(i.logisticCode))}
                              defaultChecked={selected.includes(String(i.logisticCode))}>
                    {i.logisticName}
                    <List.Item.Brief style={{borderBottomWidth: 0}}>{i.logisticDesc}</List.Item.Brief>
                </CheckboxItem>
                {/*判断美团快速达加 接单率93% & 不溢价 闪送加 专人专送*/}
                {i.logisticCode == 3 && <View style={styles.tagView}>
                    <Text style={styles.tag1}>接单率93% </Text>
                    <Text style={styles.tag2}>不溢价</Text>
                </View>}
                {i.logisticCode == 5 && <View style={{flexDirection: "row"}}>
                    <Text style={styles.tag3}>专人专送</Text>
                </View>}
        </View>
            {i.est && i.est.delivery_fee > 0  &&
            <View style={[Styles.columnCenter, footerEnd]}>
                <View style={[Styles.between]}>
                    <Text style={{fontSize: 12}}>预计</Text>
                    <Text style={{fontSize: 20, fontWeight: 'bold', color: colors.fontBlack, paddingStart: 2, paddingEnd: 2}}>{i.est.delivery_fee}</Text>
                    <Text style={{fontSize: 12}}>元</Text>
                </View>
                {i.est && i.est.coupons_amount > 0 && <View style={[Styles.between]}>
                    <Text style={{fontSize: 12, color: colors.warn_color}}>已优惠</Text>
                    <Text style={{fontSize: 12, color: colors.warn_color}}>{i.est.coupons_amount ?? 0}</Text>
                    <Text style={{fontSize: 12, color: colors.warn_color}}>元</Text>
                </View>}
            </View>}
                {!i.est && <View style={[Styles.columnAround, {borderBottomWidth: 1, borderBottomColor: colors.back_color, height: 56, paddingEnd: 10, alignItems: 'flex-end'}]}>
                    <Text style={{fontSize: 12}}>暂无预估价</Text>
                </View>}
        </View>
        ))}
      </List>
    )
  }

  renderBtn () {
    return (
      <View style={styles.btnCell}>
        <JbbButton
          onPress={() => this.onCallThirdShip()}
          text={'呼叫配送'}
          backgroundColor={color.theme}
          fontColor={'#fff'}
          fontWeight={'bold'}
          height={40}
          fontSize={pxToDp(30)}
          disabled={!this.state.newSelected.length}
        />
      </View>
    )
  }

  render() {
    return (
      <ScrollView>
        {this.renderHeader()}

        <If condition={this.state.logistics.length}>
          {this.renderLogistics()}
          <WhiteSpace/>
          {this.renderBtn()}
        </If>

        <If condition={!this.state.logistics.length}>
          <EmptyData placeholder={'无可用配送方式'}/>
        </If>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  header: {
    height: pxToDp(200),
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnCell: {
    padding: pxToDp(30)
  },
    tag1: {
        fontSize: pxToDp(22),
        color: colors.white,
        fontWeight: "bold",
        backgroundColor: colors.main_color,
        borderRadius: pxToDp(5),
        textAlign: "center",
        paddingHorizontal: pxToDp(5),
        position: "absolute",
        bottom: 33,
        left: 140
    },
    tag2: {
        fontSize: pxToDp(22),
        color: colors.white,
        fontWeight: "bold",
        backgroundColor: colors.main_color,
        borderRadius: pxToDp(5),
        textAlign: "center",
        paddingHorizontal: pxToDp(5),
        position: "absolute",
        bottom: 33,
        left: 218
    },
    tag3: {
        fontSize: pxToDp(22),
        color: colors.white,
        fontWeight: "bold",
        backgroundColor: colors.main_color,
        borderRadius: pxToDp(5),
        textAlign: "center",
        paddingHorizontal: pxToDp(5),
        position: "absolute",
        bottom: 33,
        left: 90
    },
    tagView: {
      flexDirection: "row",
        position: "relative"
    }
});

export default connect(mapStateToProps)(OrderTransferThird)

