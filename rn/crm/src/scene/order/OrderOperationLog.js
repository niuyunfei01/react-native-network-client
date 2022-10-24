import React, {PureComponent} from 'react'
import {connect} from "react-redux";
import {Dimensions, ScrollView, StyleSheet, Text, View} from 'react-native';
import tool from "../../pubilc/util/tool";
import {orderChangeLog} from "../../reducers/order/orderActions";
import {ToastLong} from "../../pubilc/util/ToastUtils";
import colors from "../../pubilc/styles/colors";
import pxToDp from "../../pubilc/util/pxToDp";

const width = Dimensions.get("window").width;

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

class OrderOperationLog extends PureComponent {
  constructor(props) {
    super(props);
    const order_id = (this.props.route.params || {}).id;
    const {is_service_mgr = false} = tool.vendor(this.props.global);
    this.state = {
      orderId: order_id,
      operationLog: []
    }
  }

  componentDidMount() {
    this._orderChangeLogQuery()
  }

  _orderChangeLogQuery = () => {
    const {dispatch, global} = this.props;
    let {orderId} = this.state;
    dispatch(orderChangeLog(orderId, global.accessToken, (ok, msg, contacts) => {
      if (ok) {
        this.setState({operationLog: contacts});
      } else {
        ToastLong(msg)
      }
    }));
  }

  renderOperationLog = () => {
    let {operationLog} = this.state
    return (
      <View style={styles.LogContent}>
        <For index='index' each='info' of={operationLog}>
          <View key={index} style={styles.logItem}>
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <Text style={styles.logItemInfo}>{info?.updated_name} </Text>
              <Text style={[styles.logItemInfo, {marginLeft: 10}]}>{info?.created} </Text>
            </View>
            <Text style={styles.logWhat}>
              {info?.what}
            </Text>
            <If condition={index !== operationLog?.length - 1}>
              <View style={styles.cuttingLine1}/>
            </If>
          </View>
        </For>
      </View>
    )
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <ScrollView
          style={styles.Content}>
          {this.renderOperationLog()}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  Content: {backgroundColor: '#F5F5F5'},
  LogContent: {
    width: width * 0.94,
    backgroundColor: colors.white,
    borderRadius: 6,
    marginLeft: width * 0.03,
    marginTop: 10,
    padding: 12, marginBottom: 20
  },
  logItem: {
    flexDirection: "column",
    marginVertical: 5
  },
  logItemInfo: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.color999,
    marginBottom: pxToDp(10)
  },
  logWhat: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.color333
  },
  cuttingLine1: {
    backgroundColor: colors.e5,
    height: 0.5,
    width: width * 0.86,
    marginTop: 10
  }
});

export default connect(mapStateToProps)(OrderOperationLog)
