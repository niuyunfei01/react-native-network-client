import React, {PureComponent} from "react";
import ReactNative, {Text, TouchableOpacity, View} from "react-native";
import screen from "../util/screen";
import colors from "../styles/colors";
import pxToDp from "../util/pxToDp";
import Cts from "../common/Cts";
import tool from "../util/tool";
import pxToEm from "../util/pxToEm";
import PropTypes from "prop-types";
import Entypo from "react-native-vector-icons/Entypo";

const {StyleSheet} = ReactNative

const Styles = StyleSheet.create({
  orderRemind: {
    borderBottomWidth: screen.onePixel,
    borderBottomColor: colors.color999,
    marginBottom: pxToDp(20),
    borderRadius: pxToDp(15),
    paddingLeft: pxToDp(30),
    paddingRight: pxToDp(30)
  },
  Title: {
    flexDirection: 'row',
    height: pxToDp(70),
    alignItems: 'center'
  },
  color333: {
    color: colors.color333
  },
  ml20: {
    marginLeft: pxToDp(20)
  },
  orderStatus: {
    backgroundColor: '#ea7575',
    height: pxToDp(50),
    paddingLeft: 5,
    paddingRight: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginLeft: pxToDp(40)
  },
  colorWhite: {
    color: colors.white
  },
  remindNicks: {
    marginRight: 5,
    marginHorizontal: 15
  },
  remindTaskDesc: {
    borderTopWidth: screen.onePixel,
    borderTopColor: '#ccc',
    paddingTop: 10,
    paddingBottom: 10
  },
  remindTaskDescText: {
    fontSize: pxToEm(12),
    color: '#808080'
  }
})

class OrderReminds extends PureComponent {

  static propTypes = {
    reminds: PropTypes.any,
    remindNicks: PropTypes.any,
    task_types: PropTypes.object,
    processRemind: PropTypes.func,
  }

  constructor(props) {
    super(props)
  }

  render() {

    const {reminds, task_types, remindNicks, processRemind} = this.props;

    return <View>{reminds.map((remind, idx) => {
      const type = parseInt(remind.type);
      const taskType = task_types['' + type];
      const status = parseInt(remind.status);
      const quick = parseInt(remind.quick);

      return <View key={remind.id}
                   style={[Styles.orderRemind, {backgroundColor: quick !== Cts.TASK_QUICK_NO ? '#edd9d9' : '#f0f9ef'}]}>
        <View style={Styles.Title}>
          <Text style={Styles.color333}>{taskType ? taskType.name : '待办'} </Text>
          <Text style={Styles.ml20}>{tool.shortTimeDesc(remind.created)} </Text>
          <View style={{flex: 1}}/>
          {status === Cts.TASK_STATUS_WAITING && remind.exp_finish_time && remind.exp_finish_time > 0 &&
          <Text style={Styles.color333}>{tool.shortTimestampDesc(remind.exp_finish_time * 1000)} </Text>}
          {status === Cts.TASK_STATUS_WAITING &&
          <TouchableOpacity style={Styles.orderStatus} onPress={() => processRemind(remind)}>
            <Text style={Styles.colorWhite}>{type === Cts.TASK_TYPE_ORDER_CHANGE ? '标记为已处理' : '处理'} </Text>
          </TouchableOpacity>
          }
          {status === Cts.TASK_STATUS_DONE && <View style={{flexDirection: 'row'}}>
            <Text style={Styles.color333}>{tool.shortTimeDesc(remind.resolved_at)} </Text>
            {remind.resolved_by &&
            <Text style={Styles.remindNicks}>{remindNicks['' + remind.resolved_by]} </Text>}
            <Entypo name='check' size={16}/>
          </View>}
        </View>
        {type === Cts.TASK_TYPE_ORDER_CHANGE &&
        <View style={Styles.remindTaskDesc}>
          <Text style={Styles.remindTaskDescText}>{remind.taskDesc} </Text>
        </View>}
      </View>;
    })}</View>
  }
}

export default OrderReminds
