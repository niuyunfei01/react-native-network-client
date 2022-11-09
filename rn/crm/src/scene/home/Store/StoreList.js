//import liraries
import React, {PureComponent} from "react";
import {FlatList, InteractionManager, Text, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import HttpUtils from "../../../pubilc/util/http";
import PropTypes from "prop-types";
import colors from "../../../pubilc/styles/colors";
import {ToastShort} from "../../../pubilc/util/ToastUtils";
import tool from "../../../pubilc/util/tool";
import {Button} from "react-native-elements";
import Config from "../../../pubilc/common/config";
import Entypo from "react-native-vector-icons/Entypo";
import {SvgXml} from "react-native-svg";
import {back, class_icon, id_icon, local_icon} from "../../../svg/svg";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        ...globalActions
      },
      dispatch
    )
  };
}

// create a component
class StoreList extends PureComponent {

  static propTypes = {
    dispatch: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      storeList: [],
      is_store_admin_or_owner: true,
      is_add: true,
      is_can_load_more: false
    };

    this.fetchData = this.fetchData.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    let {loading} = this.state;
    if (loading) {
      return;
    }
    this.setState({loading: true});

    const {accessToken} = this.props.global;
    const api = `/v4/wsb_store/listOfStore?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then((res) => {
      this.setState({
        loading: false,
        store_list: res?.lists,
        is_store_admin_or_owner: res?.is_store_admin_or_owner,
      })
    })
  }

  onPress(route, params = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  render() {
    let {is_store_admin_or_owner} = this.state;
    return (
      <View style={{flex: 1, backgroundColor: colors.f5}}>
        {this.renderHead()}
        {this.renderList()}
        <If condition={is_store_admin_or_owner}>
          {this.renderBtn()}
        </If>
      </View>
    )
  }

  renderHead = () => {
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        backgroundColor: colors.white,
        paddingHorizontal: 6,
      }}>
        <SvgXml style={{height: 44, marginRight: 8}} height={32} width={32} onPress={() => {
          this.props.navigation.goBack()
        }} xml={back()}/>
        <Text style={{
          color: colors.color333,
          fontSize: 17,
          fontWeight: 'bold',
          lineHeight: 24,
          marginRight: 40,
          flex: 1,
          textAlign: 'center'
        }}> 门店管理 </Text>
      </View>
    )
  }

  renderList() {
    let {loading, store_list} = this.state;
    return (
      <View style={{
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexGrow: 1,
      }}>
        <FlatList
          data={store_list}
          legacyImplementation={false}
          directionalLockEnabled={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          refreshing={loading}
          initialNumToRender={5}
          onEndReachedThreshold={0.3}
          onRefresh={this.onRefresh}
          onEndReached={this.onEndReached}
          onMomentumScrollBegin={this.onMomentumScrollBegin}
          keyExtractor={this._keyExtractor}
          shouldItemUpdate={this._shouldItemUpdate}
          getItemLayout={this._getItemLayout}
          // ListEmptyComponent={this.renderNoData()}
          renderItem={({item, index}) => this.renderItem(item, index)}
        />
      </View>
    )
  }

  onEndReached = () => {
    let {isCanLoadMore, is_add} = this.state;
    if (isCanLoadMore) {
      this.setState({isCanLoadMore: false}, () => {
        if (is_add) {
          this.fetchData();
        } else {
          ToastShort('已经到底部了')
        }
      })
    }
  }

  onMomentumScrollBegin = () => {
    this.setState({is_can_load_more: true})
  }
  _shouldItemUpdate = (prev, next) => {
    return prev.item !== next.item;
  }
  _getItemLayout = (data, index) => {
    return {length: 180, offset: 180 * index, index}
  }
  _keyExtractor = (item) => {
    return item?.id.toString();
  }

  onRefresh = () => {
    this.fetchData()
  }

  renderItem = (item, index) => {
    return (
      <TouchableOpacity key={index}
                        style={{
                          padding: 12,
                          marginBottom: 10,
                          backgroundColor: 'white',
                          borderRadius: 6,
                        }}
                        onPress={() => {
                          this.onPress(Config.ROUTE_STORE_ADD)
                        }}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Text
            style={{color: colors.color333, fontSize: 16, fontWeight: 'bold', lineHeight: 22}}>{item?.name}  </Text>
          <Entypo name='chevron-thin-right' style={{fontSize: 16, fontWeight: "bold", color: colors.color999}}/>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
          <SvgXml xml={local_icon()}/>
          <Text style={{fontSize: 14, color: colors.color999}}> {tool.jbbsubstr(item?.dada_address, 20)} </Text>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 6}}>
          <SvgXml xml={id_icon()}/>
          <Text style={{fontSize: 14, color: colors.color999}}> {tool.jbbsubstr(item?.id, 20)} </Text>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 12}}>
          <SvgXml xml={class_icon()}/>
          <Text style={{fontSize: 14, color: colors.color999}}> {tool.jbbsubstr(item?.category_desc, 20)} </Text>
        </View>
        <TouchableOpacity onPress={() => {
          this.onPress(Config.ROUTE_DELIVERY_LIST)
        }} style={{
          borderTopColor: colors.e5,
          borderTopWidth: 0.5,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 12
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <Text style={{color: colors.color999, fontSize: 13}}> 已开通省钱配送 </Text>
            <Text style={{color: colors.main_color, fontSize: 13}}> {1} </Text>
            <Text style={{color: colors.color999, fontSize: 13}}> 个 </Text>
            <Text style={{color: colors.color999, fontSize: 13, marginLeft: 12}}> 自有账号 </Text>
            <Text style={{color: colors.main_color, fontSize: 13}}> {1} </Text>
            <Text style={{color: colors.color999, fontSize: 13}}> 个 </Text>
          </View>
          <Entypo name='chevron-thin-right' style={{fontSize: 16, fontWeight: "bold", color: colors.color999}}/>
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  renderBtn = () => {
    return (
      <View style={{backgroundColor: colors.white, paddingHorizontal: 20, paddingVertical: 10, height: 62}}>
        <Button title={'添加门店'}
                onPress={() => this.onPress(Config.ROUTE_ORDER_RECEIVING_INFO, {type: 'add'})}
                buttonStyle={[{
                  backgroundColor: colors.main_color,
                  borderRadius: 20,
                  length: 42,
                }]}
                titleStyle={{color: colors.white, fontWeight: 'bold', fontSize: 16, lineHeight: 22}}
        />
      </View>
    )
  }
}

//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(StoreList);
