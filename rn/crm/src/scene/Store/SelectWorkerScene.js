import React, {Component} from 'react'
import {ScrollView, RefreshControl} from 'react-native'
import {bindActionCreators} from "redux";
import CommonStyle from '../../common/CommonStyles'
import {connect} from "react-redux";
import {Button, CellsTitle} from "../../weui/index";
import CheckboxCells from "../../weui/Form/CheckboxCells";
import * as globalActions from "../../reducers/global/globalActions";
import * as tool from "../../common/tool";
import {ToastShort} from "../../util/ToastUtils";

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class SelectWorkerScene extends Component {

  static navigationOptions = {
    headerTitle: '选择员工',
  };

  constructor(props: Object) {
    super(props);

    const {checked} = (this.props.navigation.state.params || {});

    let {currVendorId} = tool.vendor(this.props.global);
    const {mine} = this.props;
    let worker_list = [];
    worker_list.push({label: '不任命任何人', value: '0'});
    for (let user_info of mine.normal[currVendorId]) {
      let item = {
        label: user_info.name || user_info.nickname,
        value: user_info.id
      };
      worker_list.push(item);
    }

    this.state = {
      isRefreshing: false,
      doneSubmitting: false,
      checked: checked,
      worker_list: worker_list,
    };
  }

  _back = () => {
    const {goBack, state} = this.props.navigation;
    const params = state.params;
    if (params.actionBeforeBack) {
      params.actionBeforeBack({checked_users: this.state.checked})
    }
    goBack();
  };

  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.getVendorStore();
  }

  onSelect(checked){
    if (checked.indexOf('0') !== -1){
      if(this.state.checked.indexOf('0') !== -1 && checked.length > 1){
        ToastShort('请先取消不认命再进行选择');
        return false;
      }
      checked = ['0'];
    }
    this.setState({checked});
  }

  render() {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => this.onHeaderRefresh()}
            tintColor='gray'
          />
        }
        style={[{backgroundColor: '#f2f2f2', flex: 1}]}
      >
        <CellsTitle style={CommonStyle.cellsTitle}>请选择员工</CellsTitle>
        <CheckboxCells
          style={{marginTop: 2}}
          options={this.state.worker_list}
          onChange={(checked) => {
            this.onSelect(checked);
          }}
          value={this.state.checked}
        />

        <Button
          type='primary'
          onPress={() => this._back()}
          style={{marginVertical: 15, marginHorizontal: 15}}
        >保存</Button>
      </ScrollView>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectWorkerScene);
