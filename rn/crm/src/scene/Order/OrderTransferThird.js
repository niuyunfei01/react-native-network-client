import React, {Component} from 'react'
import {ScrollView, StyleSheet, Text, View} from 'react-native'
import {Checkbox, List, Toast, WhiteSpace} from 'antd-mobile-rn';
import {connect} from "react-redux";
import color from "../../widget/color";
import pxToDp from "../../util/pxToDp";
import JbbButton from "../component/JbbButton";
import HttpUtils from "../../util/http";
import EmptyData from "../component/EmptyData";

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

const CheckboxItem = Checkbox.CheckboxItem;

class OrderTransferThird extends Component {

  static navigationOptions = {
    headerTitle: '发第三方配送',
  };

  constructor(props: Object) {
    super(props);
    console.log('navigation params => ', this.props.navigation.state.params)
    this.state = {
      selected: this.props.navigation.state.params.selectedWay,
      newSelected: [],
      orderId: this.props.navigation.state.params.orderId,
      storeId: this.props.navigation.state.params.storeId,
      accessToken: this.props.global.accessToken,
      logistics: []
    };
  }

  componentWillMount (): void {
    this.fetchThirdWays()
  }

  fetchThirdWays () {
    const self = this;
    const api = `/api/order_third_logistic_ways/${this.state.orderId}?access_token=${this.state.accessToken}`;
    HttpUtils.get.bind(self.props.navigation)(api).then(res => {
      self.setState({logistics: res})
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
      self.props.navigation.state.params.onBack && self.props.navigation.state.params.onBack(res);
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
    console.log(logistics, selected);
    return (
      <List renderHeader={() => '选择配送方式'}>
        {logistics.map(i => (
          <CheckboxItem
            key={i.logisticCode}
            onChange={() => this.onSelectLogistic(i.logisticCode)}
            disabled={selected.includes(String(i.logisticCode))}
            defaultChecked={selected.includes(String(i.logisticCode))}>
            {i.logisticName}
            <List.Item.Brief>{i.logisticDesc}</List.Item.Brief>
          </CheckboxItem>
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
  }
});

export default connect(mapStateToProps)(OrderTransferThird)

