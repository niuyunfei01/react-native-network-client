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

  getProfitOutcomeOtherItem(id) {
    let {accessToken} = this.props.global;
    const {dispatch} = this.props;
    dispatch(fetchProfitOutcomeOtherItem(id, accessToken, async (ok, obj, desc) => {
      this.setState({query: false,});
      if (ok) {
        let {editable, label, money, remark,invalid} = obj.obj;
        this.setState({editable, label, money, remark,invalid});
      } else {
        ToastLong('操作失败');
        this.setState({query: false,})
      }
    }));
  }

  componentWillMount() {
    let {id,} = this.props.navigation.state.params;
    this.setState({
      id: id,
    });
    this.getProfitOutcomeOtherItem(id);
  }

  renderList() {
    let {editable, label, money, remark,invalid,id} = this.state;
    return <OperateIncomeItem
        state={this.state}
        item={{
          id: id,
          label:label,
          money:money,
          remark:remark,
          invalid:invalid
        }}/>
  }

  render() {
    return (
        <View style={{flex: 1}}>
          <ScrollView style={{flex: 1}}>
            {
              this.renderList()
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
