import React, {PureComponent} from 'react';
import {
  View,
  ScrollView,
} from 'react-native';

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {changeProfitInvalidate, fetchProfitOutcomeOtherItem} from "../../reducers/operateProfit/operateProfitActions";
import {ToastLong} from "../../util/ToastUtils";
import {Toast, Dialog, Icon, Button} from "../../weui/index";
import OperateIncomeItem from './OperateIncomeItem';
import tool from '../../common/tool'
function mapStateToProps(state) {
  const {mine, product, global} = state;
  return {mine: mine, product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchProfitOutcomeOtherItem,
      ...globalActions
    }, dispatch)
  }
}

class OperateOtherExpendDetailScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    let {type} = navigation.state.params;
    return {
      headerTitle: '其他支出流水',
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      item: {},
      query: true,
    }
  }

  getProfitOutcomeOtherItem() {
    let {accessToken} = this.props.global;
    const {dispatch} = this.props;
    let {id} = this.props.navigation.state.params;
    dispatch(fetchProfitOutcomeOtherItem(id, accessToken, async (ok, obj, desc) => {
      if (ok) {
        this.setState({item:obj,query: false});
        this.props.navigation.state.params.refresh()
      } else {
        ToastLong('操作失败');
        this.setState({query: false,})
      }
    }));
  }

  componentWillMount() {
    let {id} = this.props.navigation.state.params;
    this.setState({
      id: id
    });
    this.getProfitOutcomeOtherItem(id);
  }

  renderList() {
    let {editable, label, money, remark,invalid} = this.state.item;
    return <OperateIncomeItem
        update = {(id)=>{this.getProfitOutcomeOtherItem(id)}}
        item={{
          id : this.state.id,
          label:label,
          money:money,
          remark:remark,
          invalid:invalid,
          editable:editable,
        }}/>
  }

  render() {
    console.log(this.state)
    return (
        <View style={{flex: 1}}>
          <ScrollView style={{flex: 1}}>
            {
              tool.length(this.state.item) > 0 ? this.renderList():<View/>
            }
          </ScrollView>
          <Toast
              icon="loading"
              show={this.state.query}
              onRequestClose={() => {
              }}
          >加载中</Toast>
        </View>
    )
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(OperateOtherExpendDetailScene)
