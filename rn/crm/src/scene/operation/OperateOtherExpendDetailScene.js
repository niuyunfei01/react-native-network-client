import React, {PureComponent} from 'react';
import {ScrollView, View,} from 'react-native';

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchProfitOutcomeOtherItem} from "../../reducers/operateProfit/operateProfitActions";
import {hideModal, showModal, ToastLong} from "../../pubilc/util/ToastUtils";
import OperateIncomeItem from './OperateIncomeItem';
import tool from '../../pubilc/common/tool'

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

  constructor(props) {
    super(props);
    this.state = {
      item: {},
    }
    showModal('加载中')
  }

  getProfitOutcomeOtherItem() {
    let {accessToken} = this.props.global;
    const {dispatch} = this.props;
    let {id} = this.props.route.params;
    dispatch(fetchProfitOutcomeOtherItem(id, accessToken, async (ok, obj, desc) => {
      hideModal()
      if (ok) {
        this.setState({item: obj});
        this.props.route.params.refresh()
      } else {
        ToastLong('操作失败');
      }
    }));
  }

  UNSAFE_componentWillMount() {
    let {id} = this.props.route.params;
    this.setState({
      id: id
    });
    this.getProfitOutcomeOtherItem(id);
  }

  renderList() {
    let {editable, label, money, remark, invalid} = this.state.item;
    return <OperateIncomeItem
        update={(id) => {
          this.getProfitOutcomeOtherItem(id)
        }}
        item={{
          id: this.state.id,
          label: label,
          money: money,
          remark: remark,
          invalid: invalid,
          editable: editable,
        }}/>
  }

  render() {
    return (
        <View style={{flex: 1}}>
          <ScrollView style={{flex: 1}}>
            {
              tool.length(this.state.item) > 0 ? this.renderList() : <View/>
            }
          </ScrollView>

        </View>
    )
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(OperateOtherExpendDetailScene)
