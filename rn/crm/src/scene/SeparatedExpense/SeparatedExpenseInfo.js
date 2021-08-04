import React, {PureComponent} from 'react'
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {Accordion, List,Button } from '@ant-design/react-native';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import HttpUtils from "../../util/http";
import Config from "../../config";
const Item = List;
const Brief = Item;
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

class SeparatedExpenseInfo extends PureComponent {
  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: '清单详情',
        headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate(Config.ROUTE_ACCOUNT_FILL)}>
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
    })
  }

  constructor (props: Object) {
    super(props);
    this.state = {
        records: [],
        by_labels: [],
        data_labels: [],
    }

    this.navigationOptions(this.props)
  }
onItemAccountStyle(item) {
    return item.sa === 1 ? (item.amount > 0 ? style.saAmountAddStyle : style.saAmountStyle) : {};
}
 UNSAFE_componentWillMount () {
    this.fetchExpenses()
  }
    onItemClicked(item){
        console.log("clicked:", item);
        if (item.wm_id) {
            this.props.navigation.navigate(Config.ROUTE_ORDER, {orderId: item.wm_id});
        }
    }
  fetchExpenses () {
    const self = this;
    const {global} = self.props;
    console.log(self.props);
    const url = `api/new_store_separated_items/${global.currStoreId}/${self.props.route.params.day}?access_token=${global.accessToken}`;
    HttpUtils.get.bind(this.props)(url).then(res => {
      self.setState({records: res.records, by_labels: res.by_labels, data_labels: res.data_labels})
    })
  }

  render () {
      const { records } = this.state;
    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f9' }}>
            <List style={{width:"100%"}}
                  renderHeader={()=>{
                      return <View style={{flexDirection: 'row', alignItems: 'center',  width:"100%",height: 40, backgroundColor:"#fff"}}>
                          <Text style={{ paddingLeft:'5%',paddingRight: '5%'}}>{this.props.route.params.day}</Text>
                          <Text style={{ paddingLeft:'5%',paddingRight: '5%'}}>{this.props.route.params.total_balanced !== '' ? (`外送帮余额：${this.props.route.params.total_balanced}`) : ''}</Text>
                      </View>
                  }}
            >
                {records.map((item, idx) => {
                    return <List.Item arrow="horizontal"
                                      key={idx}
                                      multipleLine
                                      onClick={() => this.onItemClicked(item)}
                                      extra={<View style={{'flex-direction': 'row', 'justify-content': 'space-between'}}>
                                          <Text style={[{'textAlign': 'right', marginLeft: 'auto'}, this.onItemAccountStyle(item)]}>{`${item.amount > 0 && '+' || ''}${item.amount}`}</Text>
                                          <List.Item.Brief style={{textAlign: 'right'}}><Text style={this.onItemAccountStyle(item)}>{this.state.by_labels[item.by]}</Text></List.Item.Brief>
                                      </View>}>
                        {item.name}
                            <List.Item.Brief><Text>{item.hm} {item.wm_id && this.state.data_labels[item.wm_id] || ''}</Text></List.Item.Brief>
                    </List.Item>
                })}
            </List>
      </ScrollView>
    )
  }
}

const style = StyleSheet.create({
  saAmountStyle: {
    color: colors.orange,
  },
  saAmountAddStyle: {
    color: colors.main_vice_color,
  },
    right_btn: {
        fontSize: pxToDp(40),
        textAlign: "center",
        color: colors.main_color
    },
    chevron_right: {
        position: "absolute",
        right: 0,
        justifyContent: "center",
        alignItems: "flex-start",
        width: pxToDp(60),
        height: pxToDp(140)
    },
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
});

export default connect(mapStateToProps, mapDispatchToProps)(SeparatedExpenseInfo);
