import React, {Component} from "react";
import {bindActionCreators} from "redux";
import {
  Image,
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import {connect} from "react-redux";
import colors from "../../pubilc/styles/colors";
import {userCanChangeStore} from "../../reducers/mine/mineActions";
import {Button, SearchBar} from 'react-native-elements';
import HttpUtils from "../../pubilc/util/http";
import tool from "../../pubilc/util/tool";
import Config from "../../pubilc/common/config";
import PropTypes from "prop-types";

function mapStateToProps(state) {
  return {
    global: state.global
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {userCanChangeStore},
      dispatch
    )
  };
}

function FetchView({navigation, onRefresh}) {
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh()
    });
    return unsubscribe;
  }, [navigation])
  return null;
}

class OrderAddressBook extends Component {

  static propTypes = {
    route: PropTypes.object,
  };

  constructor(props: Object) {
    super(props);
    let {accessToken} = this.props.global
    this.state = {
      accessToken: accessToken,
      addressBook: [],
      searchKeywords: '',
      isRefreshing: true,
      headerShown: true,
    };
  }

  setHeader = (show = false) => {
    const {navigation} = this.props
    this.setState({
      headerShown: show,
    })
    navigation.setOptions({
      headerShown: show,
    })
  }

  componentDidMount() {
    const {navigation} = this.props
    this.focus = navigation.addListener('focus', () => {
      this.fetchAddressBook()
    })
  }

  componentWillUnmount() {
    this.focus()
  }

  onPress(route, params = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  fetchAddressBook() {
    const {searchKeywords} = this.state
    const api = `/v1/new_api/address/queryAddressList?access_token=${this.state.accessToken}`;
    let params = {
      keyword: searchKeywords
    }
    HttpUtils.get.bind(this.props)(api, params).then(res => {
      this.setState({
        addressBook: res,
        isRefreshing: false,
        searchKeywords: ''
      })
    })
  }


  onHeaderRefresh() {
    this.fetchAddressBook();
  }

  onCancel() {
    this.setHeader(true);
    this.setState({searchKeywords: ''});
  }

  onCheck = (info) => {
    tool.debounces(() => {
      this.props.route.params.onBack(info)
      this.props.navigation.goBack()
    }, 1000)
  }

  render() {
    let {headerShown, isRefreshing, addressBook} = this.state
    return (
      <View style={{flex: 1}}>
        <FetchView navigation={this.props.navigation} onRefresh={this.onHeaderRefresh.bind(this)}/>
        <ScrollView
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={[styles.container, {flex: 1}]} refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => this.onHeaderRefresh()}
            tintColor='gray'
          />
        }>
          {this.renderHeader()}
          <If condition={addressBook?.length <= 0}>
            <View
              style={{alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', height: 300}}>
              <Image
                source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/%E6%9A%82%E6%97%A0%E8%AE%A2%E5%8D%95%403x.png'}}
                style={{width: 100, height: 100, marginBottom: 20}}/>
              <Text style={{fontSize: 18, color: colors.b2}}>
                暂无数据
              </Text>
            </View>
          </If>
          <If condition={addressBook?.length > 0}>
            {this.renderList()}
          </If>
        </ScrollView>

        <If condition={headerShown}>
          {this.renderBtn()}
        </If>
      </View>
    );
  }

  renderHeader = () => {
    let {headerShown, searchKeywords} = this.state
    return (
      <View style={{backgroundColor: colors.white}}>
        <View style={{flexDirection: "row", alignItems: "center", padding: 10}}>
          <SearchBar
            inputStyle={{fontSize: 14, color: colors.color333}}
            leftIconContainerStyle={{
              width: 20,
              height: 20
            }}
            cancelIcon={true}
            clearIcon={true}
            inputContainerStyle={{
              backgroundColor: colors.f5,
              height: 32,
              borderRadius: 16,
              borderWidth: 0
            }}
            containerStyle={{
              flex: 1,
              padding: 0,
              margin: 0,
              height: 31,
              borderRadius: 16
            }}
            onFocus={() => {
              this.setHeader(false);
            }}
            onBlur={() => {
              this.setHeader(true);
            }}
            lightTheme={'true'}
            placeholder="请输入地址，姓名，手机号搜索"
            onChangeText={(searchKeywords) => {
              this.setState({
                searchKeywords
              }, () => {
                tool.debounces(() => {
                  this.fetchAddressBook()
                })
              })
            }}
            onCancel={this.onCancel}
            value={searchKeywords}
          />
          <If condition={!headerShown}>
            <Text onPress={() => this.onCancel()}
                  style={{textAlign: 'center', width: 56, fontSize: 14, color: colors.color333}}>取消</Text>
          </If>
        </View>
      </View>
    )
  }

  renderList = () => {
    let {addressBook} = this.state
    return (
      <View style={{paddingHorizontal: 12, paddingVertical: 10}}>
        <View style={{borderRadius: 8, flex: 1, paddingHorizontal: 12, backgroundColor: colors.white}}>
          <For index="index" each="info" of={addressBook}>
            <TouchableOpacity onPress={() => {
              this.onCheck(info)
            }} style={{paddingVertical: 20, borderColor: colors.e5, borderBottomWidth: 0.5}}>
              <View style={{flexDirection: 'row', alignContent: 'center'}}>
                <If condition={info?.is_often_use}>
                  <View
                    style={{backgroundColor: '#FF8309', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 8,}}>
                    <Text style={{color: colors.white, fontSize: 12}}>常用</Text>
                  </View>
                </If>
                <Text style={{
                  color: colors.color333,
                  fontSize: 16,
                  marginLeft: info?.is_often_use ? 4 : 0,
                  fontWeight: '500'
                  // eslint-disable-next-line no-undef
                }}>{tool.length((info.address + info.street_block || '')) > 18 ? (info.address + info.street_block).substring(0, 17) + '...' : (info.address + info.street_block)} </Text>
              </View>
              <View style={{flexDirection: 'row', marginTop: 10}}>
                {/* eslint-disable-next-line no-undef */}
                <Text style={{fontSize: 14, color: colors.color666, width: 60}}>{info.name} </Text>
                {/* eslint-disable-next-line no-undef */}
                <Text style={{fontSize: 14, color: colors.color666, flex: 1}}>{info.phone} </Text>
                {/*<Text style={{fontSize: 14, color: colors.main_color, width: 56}}>收藏</Text>*/}
                <Text onPress={() => {
                  // eslint-disable-next-line no-undef
                  this.onPress(Config.ROUTE_ORDER_RECEIVING_INFO, {info, type: 'edit'})
                }} style={{fontSize: 14, color: colors.main_color}}>编辑 </Text>
              </View>
            </TouchableOpacity>
          </For>
        </View>
      </View>
    )
  }

  renderBtn = () => {
    return (
      <View style={{backgroundColor: colors.white, padding: 15}}>
        <Button title={'添加常用收件人'}
                onPress={() => this.onPress(Config.ROUTE_ORDER_RECEIVING_INFO, {type: 'add'})}
                buttonStyle={[{
                  backgroundColor: colors.main_color,
                  borderRadius: 24,
                  length: 48,
                }]}
                titleStyle={{color: colors.f7, fontWeight: '500', fontSize: 20, lineHeight: 28}}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {backgroundColor: "#f2f2f2"},
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderAddressBook);
