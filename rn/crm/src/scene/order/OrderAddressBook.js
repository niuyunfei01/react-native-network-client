import React, {Component} from "react";
import {bindActionCreators} from "redux";
import {InteractionManager, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";

import {connect} from "react-redux";
import colors from "../../pubilc/styles/colors";
import {userCanChangeStore} from "../../reducers/mine/mineActions";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {Button, SearchBar} from 'react-native-elements';
import pxToDp from "../../pubilc/util/pxToDp";
import Config from "../../pubilc/common/config";
import HttpUtils from "../../pubilc/util/http";
import {hideModal, showError, showModal, showSuccess} from "../../pubilc/util/ToastUtils";

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
  constructor(props: Object) {
    super(props);
    let {accessToken} = this.props.global
    this.state = {
      accessToken: accessToken,
      addressBook: [],
      searchKeywords: '',
      isRefreshing: true
    };

  }

  componentDidMount() {
  }

  UNSAFE_componentWillMount() {
    this.fetchAddressBook()
  }


  onPress(route, params = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  timeOutBack(time) {
    let _this = this;
    setTimeout(() => {
      _this.props.navigation.goBack()
    }, time)
  }

  onCancel() {
    this.setState({searchKeywords: ''});
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

  deleteAddressItemBook(id) {
    showModal('正在删除请稍后...')
    const api = `/v1/new_api/address/deleteAddress?access_token=${this.state.accessToken}`;
    HttpUtils.get.bind(this.props)(api, {id: id}).then(res => {
      hideModal()
      showSuccess('删除成功')
      this.onHeaderRefresh()
    })
  }

  onHeaderRefresh() {
    this.fetchAddressBook();
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <FetchView navigation={this.props.navigation} onRefresh={this.onHeaderRefresh.bind(this)}/>
        <ScrollView style={[styles.container, {flex: 1}]} refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => this.onHeaderRefresh()}
            tintColor='gray'
          />
        }>
          <View style={{backgroundColor: colors.white}}>
            <View style={{flexDirection: "row", alignItems: "center", padding: 10}}>
              <SearchBar
                inputStyle={{fontSize: 12}}
                inputContainerStyle={{backgroundColor: colors.white, height: 35}}
                containerStyle={{
                  width: '70%',
                  padding: 0,
                  margin: 0,
                  backgroundColor: colors.white,
                  borderWidth: 1,
                  borderColor: '#eee',
                  borderRadius: 6
                }}
                lightTheme={'true'}
                placeholder="姓名 手机号 地址"
                onChangeText={(v) => {
                  this.setState({
                    searchKeywords: v
                  })
                }}
                onCancel={this.onCancel}
                value={this.state.searchKeywords}
              />
              <Button title={'搜索'}
                      onPress={() => {
                        this.fetchAddressBook()
                      }}
                      buttonStyle={{
                        borderRadius: pxToDp(10),
                        borderWidth: 1,
                        borderColor: colors.color333,
                        backgroundColor: colors.white,
                        marginLeft: 10,
                        padding: 5
                      }}
                      titleStyle={{
                        color: colors.color333,
                        fontSize: 16
                      }}
              />
              <Button title={'重置'}
                      onPress={() => {
                        this.fetchAddressBook()
                      }}
                      buttonStyle={{
                        borderRadius: pxToDp(10),
                        borderWidth: 1,
                        borderColor: colors.color333,
                        backgroundColor: colors.white,
                        marginLeft: 10,
                        padding: 5
                      }}
                      titleStyle={{
                        color: colors.color333,
                        fontSize: 16
                      }}
              />
            </View>
          </View>
          <For index="index" each="info" of={this.state.addressBook}>
            <TouchableOpacity style={{
              flexDirection: "column",
              width: '96%',
              marginTop: '2%',
              marginHorizontal: '2%',
              borderRadius: 10,
              backgroundColor: colors.white
            }} onPress={() => {
              this.onPress(Config.ROUTE_ORDER_SETTING, {addressItem: info}, () => {
                this.onHeaderRefresh()
              })
            }}>
              <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", margin: 15}}>
                <View style={{flexDirection: "row"}}>
                  <Text style={{color: colors.color333, marginRight: 10}}>{info.name}</Text>
                  <Text style={{color: colors.color333}}>{info.phone}</Text>
                </View>
                <View style={{flexDirection: "row"}}>
                  <TouchableOpacity style={{flexDirection: "row", marginRight: 10}} onPress={() => {
                    this.onPress(Config.ROUTE_ORDER_RECEIVING_INFO, {addItem: info, type: 'edit'})
                  }}>
                    <FontAwesome name='pencil-square-o' style={{fontSize: 16}}/><Text
                    style={{color: colors.color333, fontSize: 12}}> 编辑 </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{flexDirection: "row"}} onPress={() => {
                    this.deleteAddressItemBook(info.id)
                  }}>
                    <FontAwesome name='pencil-square-o' style={{fontSize: 16}}/><Text
                    style={{color: colors.color333, fontSize: 12}}> 删除 </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{flexDirection: "row", alignItems: "center", marginHorizontal: 15, marginBottom: 10}}>
                <Text style={{color: colors.color999}}>{info.address}{info.street_block}</Text>
              </View>
            </TouchableOpacity>
          </For>
        </ScrollView>
        <View style={{backgroundColor: colors.white, padding: pxToDp(30)}}>
          <Button title={'新增收货地址'}
                  onPress={() => {
                    this.onPress(Config.ROUTE_ORDER_RECEIVING_INFO, {type: 'add'})
                  }}
                  buttonStyle={{
                    borderRadius: pxToDp(10),
                    backgroundColor: colors.main_color,
                  }}
                  titleStyle={{
                    color: colors.white,
                    fontSize: 16
                  }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {backgroundColor: "#f2f2f2"},
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderAddressBook);
