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
import {fetchWmStore, setWmStoreStatus} from "../../reducers/mine/mineActions";
import {ToastLong, ToastShort} from "../../util/ToastUtils";
import Toast from "../../weui/Toast/Toast";
import SearchBar from "../../weui/SearchBar/SearchBar";
import {Paragraph} from "../../widget/Text";
import {screen, system, tool, native} from '../../common/index';
import NavigationItem from "../../widget/NavigationItem";
import Config from "../../config";


function mapStateToProps(state) {
  const {mine, user, global} = state;
  return {mine: mine, user: user, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchWmStore,
      setWmStoreStatus,
      ...globalActions
    }, dispatch)
  }
}

class VersionScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;

    return {
      headerTitle: (
        <View>
          <Text style={{color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'}}>版本信息</Text>
        </View>
      ),
      headerRight: '',
    }
  };
  // static navigationOptions = {title: 'Mine', header: null};

  constructor(props: Object) {
    super(props);

    // let {currVendorId, currVendorName} = tool.vendor(this.props.global);
    let {currStoreId} = this.props.global;

    native.currentVersion((json) => {
      console.log('currentVersion -> ', json);
    });
    //json.version_code, json.version_name
    console.log('global.config.v_b -> ', this.props.global.config.v_b);

    this.state = {
      isRefreshing: false,
    };
  }

  componentDidMount() {
  }


  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.setState({isRefreshing: false});
  }

  onPress(route, params = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
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
        style={{backgroundColor: colors.main_back}}
      >
      </ScrollView>
    );
  }

}


const styles = StyleSheet.create({
});


export default connect(mapStateToProps, mapDispatchToProps)(VersionScene)
