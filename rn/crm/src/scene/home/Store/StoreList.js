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
      is_add: true,
      is_can_load_more: false,
      page: 1,
      page_size: 10,
      is_store_admin_or_owner: false,
    };
  }

  componentWillUnmount() {
    this.focus()
  }

  componentDidMount() {
    this.focus = this.props.navigation.addListener('focus', () => {
      this.onRefresh()
    })
  }

  fetchData(set_list = 0) {
    let {loading, page, page_size, store_list} = this.state;
    if (loading) {
      return;
    }
    this.setState({loading: true});

    const {accessToken} = this.props.global;
    const api = `/v4/wsb_store/listOfStore?access_token=${accessToken}`
    let params = {
      page,
      page_size
    };

    HttpUtils.get.bind(this.props)(api, params).then((res) => {
      this.setState({
        loading: false,
        is_add: tool.length(res?.lists) >= page_size,
        page: page + 1,
        store_list: set_list === 0 ? res?.lists : store_list.concat(res?.lists),
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
        <SvgXml style={{height: 44, marginRight: 4}} onPress={() => {
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
        paddingBottom: 10,
        flex: 1,
      }}>
        <FlatList
          data={store_list}
          legacyImplementation={false}
          directionalLockEnabled={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          refreshing={loading}
          initialNumToRender={5}
          onEndReachedThreshold={0.5}
          onRefresh={this.onRefresh}
          onEndReached={this.onEndReached}
          onMomentumScrollBegin={this.onMomentumScrollBegin}
          keyExtractor={(item, index) => `${index}`}
          shouldItemUpdate={this._shouldItemUpdate}
          getItemLayout={this._getItemLayout}
          // ListEmptyComponent={this.renderNoData()}
          renderItem={this.renderItem}
        />
      </View>
    )
  }

  onEndReached = () => {
    let {is_can_load_more, is_add} = this.state;
    if (is_can_load_more) {
      this.setState({is_can_load_more: false}, () => {
        if (is_add) {
          this.fetchData(1);
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

  onRefresh = () => {
    this.setState({
      page: 1,
      is_add: true,
    }, () => {
      this.fetchData()
    })
  }

  renderItem = ({item}) => {
    const {id, name, dada_address, category_desc, count_of_wsb_delivery, count_of_store_delivery} = item
    return (
      <TouchableOpacity style={{padding: 12, marginTop: 10, backgroundColor: 'white', borderRadius: 6}}
                        onPress={() => {
                          this.onPress(Config.ROUTE_SAVE_STORE, {type: 'edit', store_id: id})
                        }}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Text style={{color: colors.color333, fontSize: 16, fontWeight: 'bold', lineHeight: 22}}>
            {`${name}  `}
          </Text>
          <Entypo name='chevron-thin-right' style={{fontSize: 16, fontWeight: "bold", color: colors.color999}}/>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
          <SvgXml xml={local_icon()}/>
          <Text style={{fontSize: 14, color: colors.color999}}> {tool.jbbsubstr(dada_address, 20)} </Text>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 6}}>
          <SvgXml xml={id_icon()}/>
          <Text style={{fontSize: 14, color: colors.color999}}> {tool.jbbsubstr(id, 20)} </Text>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 12}}>
          <SvgXml xml={class_icon()}/>
          <Text style={{fontSize: 14, color: colors.color999}}> {tool.jbbsubstr(category_desc, 20)} </Text>
        </View>
        <TouchableOpacity onPress={() => {
          this.onPress(Config.ROUTE_DELIVERY_LIST, {store_id: id, show_select_store: false, store_name: name})
        }} style={{
          borderTopColor: colors.e5,
          borderTopWidth: 0.5,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 12,
        }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <If condition={count_of_wsb_delivery > 0}>
              <Text style={{color: colors.color999, fontSize: 13}}> 已开通省钱配送 </Text>
              <Text style={{color: colors.main_color, fontSize: 13}}> {count_of_wsb_delivery} </Text>
              <Text style={{color: colors.color999, fontSize: 13}}> 个 </Text>
            </If>
            <If condition={count_of_store_delivery > 0}>
              <Text style={{color: colors.color999, fontSize: 13, marginLeft: 12}}> 自有账号 </Text>
              <Text style={{color: colors.main_color, fontSize: 13}}> {count_of_store_delivery} </Text>
              <Text style={{color: colors.color999, fontSize: 13}}> 个 </Text>
            </If>
            <If condition={count_of_wsb_delivery <= 0 && count_of_store_delivery <= 0}>
              <Text style={{color: colors.color999, fontSize: 13}}> 暂未开通运力 </Text>
            </If>
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
                onPress={() => {
                  this.onPress(Config.ROUTE_SAVE_STORE)
                }}
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
