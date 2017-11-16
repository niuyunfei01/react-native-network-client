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
import {screen, system, tool, native} from '../../common'
import NavigationItem from "../../widget/NavigationItem";


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

class OrderSearchScene extends PureComponent {
  /*static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;

    return {
      headerTitle: (
        <View>
          <Text style={{color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'}}>订单搜索</Text>
        </View>
      ),
      headerRight: '',
    }
  };*/
  static navigationOptions = {title: 'Mine', header: null};

  constructor(props: Object) {
    super(props);

    // let {currVendorId, currVendorName} = tool.vendor(this.props.global);
    let {currStoreId} = this.props.global;

    this.state = {
      isRefreshing: false,
      isSearching: false,
    };
  }

  componentDidMount() {
  }


  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.setState({isRefreshing: false});
  }

  onSearch = (search) => {
    console.log('search -> ', search);
    alert(search);
  };

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
        <SearchBar
          placeholder="请输入搜索内容"
          // onChange={this.handleChange.bind(this)}
          onBlurSearch={this.onSearch.bind(this)}
        />

        <Toast
          icon="loading"
          show={this.state.isSearching}
          onRequestClose={() => {
          }}
        >提交中</Toast>
      </ScrollView>
    );
  }

}


const styles = StyleSheet.create({

});


export default connect(mapStateToProps, mapDispatchToProps)(OrderSearchScene)
