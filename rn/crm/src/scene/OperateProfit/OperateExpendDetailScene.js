import React, {PureComponent} from 'react';
import {ScrollView, StyleSheet, Text, View,} from 'react-native';
import {Cell, CellBody, CellFooter, CellHeader, Cells,} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import {fetchProfitOutcomeNormalList} from "../../reducers/operateProfit/operateProfitActions";
import tool from '../../common/tool';
import {hideModal, showModal} from "../../util/ToastUtils";
import RenderEmpty from './RenderEmpty'

function mapStateToProps(state) {
  const {mine, product, global} = state;
  return {mine: mine, product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchProfitOutcomeNormalList,
      ...globalActions
    }, dispatch)
  }
}

class OperateExpendScene extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      query: true,
      items: []
    }
    showModal('加载中')
    this.navigationOptions(this.props)
  }

  navigationOptions = ({navigation, route}) => {
    let {type} = route.params;
    navigation.setOptions({
      headerTitle: tool.getOperateDetailsType(type),
    })
  };

  UNSAFE_componentWillMount() {
    this.getProfitOutcomeNormalList()
  }

  getProfitOutcomeNormalList() {
    let {currStoreId, accessToken} = this.props.global;
    let {day, type} = this.props.route.params;
    const {dispatch} = this.props;
    dispatch(fetchProfitOutcomeNormalList(type, currStoreId, day, accessToken, async (ok, obj, desc) => {
      console.log('obj', obj);
      if (ok) {
        this.setState({items: obj.items})
      }
      hideModal()
      this.setState({query: false,})
    }));
  }

  renderList() {
    let {items} = this.state;
    if (items.length > 0) {
      return items.map((item, index) => {
        let {day, money, label, order_label, order_id} = item;
        return (
          <Cells style={{marginTop: 0, borderTopColor: '#FFFFFF', borderBottomColor: '#bfbfbf'}} key={index}>
            <Cell access
                  style={content.cell}
                  onPress={() => {

                  }}
            >
              <CellHeader style={content.header}>
                <Text style={content.order_num}>{order_label}</Text>
                <Text style={content.classify}>{label}</Text>
              </CellHeader>
              <CellBody/>
              <CellFooter>
                <View>
                  <Text style={content.date}>{day}</Text>
                  <Text style={content.money}>{money}</Text>
                </View>
              </CellFooter>
            </Cell>
          </Cells>
        )

      })
    } else {
      return <RenderEmpty/>
    }

  }

  render() {
    return (
      <View style={{flex: 1}}>
        <ScrollView style={{flex: 1}}>
          {
            this.renderList()
          }

        </ScrollView>
        {/*<Toast*/}
        {/*    icon="loading"*/}
        {/*    show={this.state.query}*/}
        {/*    onRequestClose={() => {*/}
        {/*    }}*/}
        {/*>加载中</Toast>*/}
      </View>
    )
  }
}

const content = StyleSheet.create({
  item_header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: pxToDp(60),
    paddingHorizontal: pxToDp(30)
  },
  item_time: {
    fontSize: pxToDp(28),
    color: colors.fontColor
  },
  cell: {
    height: pxToDp(150),
    alignItems: 'center',
    justifyContent: 'center'
  },

  date: {
    fontSize: pxToDp(30),
    color: '#9d9c9c',
    height: pxToDp(50),

  },
  order_num: {
    fontSize: pxToDp(36),
    color: colors.main_color,
    height: pxToDp(50)
  },
  classify: {
    fontSize: pxToDp(30),
    color: colors.color3334,
    marginTop: pxToDp(20),
  },
  money: {
    fontSize: pxToDp(36),
    color: '#3e3e3e',
    marginTop: pxToDp(20),
    textAlign: 'right'
  }
});
export default connect(mapStateToProps, mapDispatchToProps)(OperateExpendScene)
