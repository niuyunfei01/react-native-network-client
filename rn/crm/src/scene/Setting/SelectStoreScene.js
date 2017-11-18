//import liraries
import React, {PureComponent} from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  InteractionManager
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {ToastLong, ToastShort} from "../../util/ToastUtils";
import Toast from "../../weui/Toast/Toast";
import {native} from '../../common';
import NavigationItem from "../../widget/NavigationItem";
import Config from "../../config";
import ModalSelector from "../../widget/ModalSelector/index";


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

class SelectStoreScene extends PureComponent {
  static navigationOptions = {title: 'Select', header: null};

  constructor(props: Object) {
    super(props);

    const {canReadStores} = this.props.global;

    let storeActionSheet = [{key: -999, section: true, label: '选择门店'}];
    let sortStores = Object.values(canReadStores).sort(function (a, b) {
      return (parseInt(a.vendor_id) - parseInt(b.vendor_id) )
    });
    for (let store of sortStores) {
      if (store.id > 0) {
        let item = {
          key: store.id,
          label: store.vendor === null ? store.name : (store.vendor + ':' + store.name),
        };
        storeActionSheet.push(item);
      }
    }

    this.state = {
      isRefreshing: false,
      storeActionSheet: storeActionSheet,
    };

    this._doChangeStore = this._doChangeStore.bind(this);
  }

  _doChangeStore(StoreId) {
    let {params} = this.props.navigation.state;
    params.doneSelectStore(StoreId);
  }


  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.setState({isRefreshing: false});
  }

  onPress(route, params = {}) {
    let _this = this;

    if (route === Config.ROUTE_ORDER_INVALID) {
      native.ordersInvalid();
      return;
    } else if (route === Config.ROUTE_ORDER_SERIOUS_DELAY) {
      native.ordersSeriousDelay();
      return;
    }

    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  render() {
    return (
      <ModalSelector
        onChange={(option) => {
          this._doChangeStore(option.key)
        }}
        modalVisible={true}
        skin='customer'
        data={this.state.storeActionSheet}
      >
        <Text>  </Text>
      </ModalSelector>
    );
  }

}


const styles = StyleSheet.create({});


export default connect(mapStateToProps, mapDispatchToProps)(SelectStoreScene)
