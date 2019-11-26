import React, {PureComponent} from 'react'
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {Accordion, List} from 'antd-mobile-rn';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import HttpUtils from "../../util/http";
import Config from "../../config";

const Brief = List.Item.Brief;

function mapStateToProps (state) {
  const {mine, user, global} = state;
  return {mine: mine, user: user, global: global}
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class SeparatedExpense extends PureComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '帐户清单',
        headerRight: (
            <TouchableOpacity onPress={() => navigation.navigate('AccountFill')}>
                <View style={{
                        width: pxToDp(96),
                        height: pxToDp(46),
                        backgroundColor: colors.main_color,
                        marginRight: 8,
                        borderRadius: 10,
                        justifyContent: "center",
                        alignItems: "center"
                    }} >
                    <Text style={{color: colors.white, fontSize: 14, fontWeight: "bold"}} > 充值 </Text>
                </View>
            </TouchableOpacity>
        )
    }
  }

  constructor (props: Object) {
    super(props);
    this.state = {
      records: [],
      by_labels: [],
      data_labels: []
    }
  }

  componentWillMount () {
    this.fetchExpenses()
  }

  fetchExpenses () {
    const self = this
    const {global} = self.props
    const url = `api/store_separated_items/${global.currStoreId}?access_token=${global.accessToken}`
    HttpUtils.get.bind(this.props)(url).then(res => {
      self.setState({records: res.records, by_labels: res.by_labels, data_labels: res.data_labels})
    })
  }

  renderAccordionHeader (record) {
    return (
      <View style={{
        flexDirection: "row",
        justifyContent: 'space-between',
        width: '95%',
        height: 40,
        alignItems: 'center',
        paddingRight: '5%'
      }}>
        <Text>{record.day}</Text>
        <Text style={{textAlign: 'right'}}>余额：{record.total_balanced} </Text>
      </View>
    )
  }

  renderAccordionItems () {
    return this.state.records && this.state.records.map((record, idx) => {
          return <Accordion.Panel header={this.renderAccordionHeader(record)}
              key={idx} index={idx}
              style={{backgroundColor: '#fff'}} >
            {record && this.renderRecordsOfDay(record)}
          </Accordion.Panel>
        }
      )
  }

  onItemClicked (item) {
      console.log("item clicked:", item)
      if (item.wm_id) {
        this.props.navigation.navigate(Config.ROUTE_ORDER, {orderId: item.wm_id});
      }
  }

  renderRecordsOfDay(record) {
      const self = this
    if (record.items) {
      return  <List>
        {record.items.map((item, idx) => {
          return <List.Item arrow="horizontal"
                            multipleLine
                            onPress={(item) => console.log(item)}
                            extra={<View>
                              {`${item.amount > 0 && '+' || ''}${item.amount}`}
                              <Brief style={{'textAlign': 'right'}}>{self.state.by_labels[item.by]}</Brief>
                            </View>}>
            {item.name}
            <Brief>{item.hm} {item.wm_id && this.state.data_labels[item.wm_id] || ''}</Brief>
          </List.Item>
        })}
      </List>
    } else {
      return <View><Text>没有详细记录</Text></View>
    }
  }

  render () {
    return (
        <ScrollView maintainVisibleContentPosition={true}>
        <Accordion accordion defaultActiveKey="0">
          {this.renderAccordionItems()}
        </Accordion>
      </ScrollView>
    )
  }
}

const style = StyleSheet.create({
  status: {
    borderWidth: pxToDp(1),
    height: pxToDp(30),
    borderRadius: pxToDp(20),
    width: pxToDp(68),
    fontSize: pxToDp(16),
    textAlign: "center",
    justifyContent: "center",
    color: colors.fontGray,
    borderColor: colors.fontGray,
    lineHeight: pxToDp(28)
  },
  success: {
    color: colors.main_color,
    borderColor: colors.main_color
  },
  warn: {
    color: colors.orange,
    borderColor: colors.orange
  },
  detailBox: {
    padding: pxToDp(40),
    backgroundColor: '#fff'
  },
  remarkBox: {
    flexDirection: 'row'
  }
})


export default connect(mapStateToProps, mapDispatchToProps)(SeparatedExpense)
