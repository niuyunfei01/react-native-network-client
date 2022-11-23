import React, {PureComponent} from 'react'
import {connect} from "react-redux";
import {
  Dimensions,
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {Button, CheckBox} from "react-native-elements";
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import HttpUtils from "../../../pubilc/util/http";
import AntDesign from "react-native-vector-icons/AntDesign";
import Config from "../../../pubilc/common/config";
import {check_icon} from "../../../svg/svg";
import {SvgXml} from "react-native-svg";

const width = Dimensions.get("window").width;

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
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

class GoodsSelectSpecScence extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      series_id: this.props.route.params?.series_id,
      store_id: this.props.route.params?.store_id,
      currentSpecs: [],
      otherSpec: [],
      selectArr: [],
      selected_pids: this.props.route.params?.selected_pids || '',
      sku_max_num: this.props.route.params?.sku_max_num || 0,
      initLength: 0
    }
  }

  componentDidMount() {
    this.fetchSpecList()
  }

  onPress = (route, params) => {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  fetchSpecList = () => {
    const {accessToken} = this.props.global;
    let {series_id, store_id, selected_pids} = this.state;
    const api = `/v1/new_api/store_product/product_sku_list/${store_id}/${series_id}`
    HttpUtils.get.bind(this.props)(api, {
      access_token: accessToken,
      selected_pids: selected_pids
    }).then(res => {
      this.setState({
        currentSpecs: res?.skus,
        otherSpec: res?.no_skus,
        initLength: res?.skus.length + res?.no_skus.length
      })
    })
  }

  touchOtherSpecItem = (idx, info) => {
    let {selectArr} = this.state;
    let menu = [...this.state.otherSpec]
    menu[idx].checked = !menu[idx].checked;
    this.setState({
      menus: menu
    })
    if (menu[idx].checked) {
      selectArr.push(info)
    } else {
      selectArr.splice(selectArr.findIndex(index => Number(index) == info.id), 1)
    }
    this.setState({
      selectArr,
      otherSpec: menu
    })
  }

  sureCheckSpec = () => {
    let {selectArr} = this.state;
    this.props.route.params.onBack(selectArr)
    this.props.navigation.goBack();
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <FetchView navigation={this.props.navigation} onRefresh={this.fetchSpecList.bind(this)}/>
        <ScrollView
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={() => this.fetchSpecList()}
              tintColor='gray'
            />
          }
          style={styles.Content}>
          {this.renderEditInfo()}
        </ScrollView>
        {this.renderBtn()}
      </View>
    );
  }

  renderEditInfo = () => {
    let {
      currentSpecs, otherSpec, series_id, sku_max_num, initLength
    } = this.state
    return (
      <View style={styles.InfoBox}>
        <View style={styles.item_body}>
          <View style={styles.item_row}>
            <Text style={styles.item_title}>当前使用的规格 </Text>
          </View>
          <For of={currentSpecs} each="info" index="idx">
            <View key={idx}>
              <View style={styles.flexRowNormal}>
                <View>
                  <Text style={styles.specSkuName}>{info.sku_name} </Text>
                  <Text style={styles.specSkuUpc}>upc: {info.upc} </Text>
                </View>
              </View>
              <If condition={currentSpecs.length - 1 !== idx}>
                <View style={styles.cutLine}/>
              </If>
            </View>
          </For>
        </View>
        <View style={styles.item_body}>
          <View style={styles.item_row}>
            <Text style={styles.item_title}>其他规格 </Text>
          </View>
          <For of={otherSpec} each="info" index="idx">
            <View key={idx}>
              <TouchableOpacity style={styles.flexRowNormal} onPress={() => this.touchOtherSpecItem(idx, info)}>
                <CheckBox
                  checked={info.checked}
                  checkedColor={colors.main_color}
                  checkedIcon={<SvgXml xml={check_icon()} width={18} height={18}/>}
                  uncheckedColor={'#DDDDDD'}
                  size={18}
                  onPress={() => this.touchOtherSpecItem(idx, info)}
                />
                <View>
                  <Text style={styles.specSkuName}>{info.sku_name} </Text>
                  <Text style={styles.specSkuUpc}>upc: {info.upc} </Text>
                </View>
              </TouchableOpacity>
              <If condition={idx !== otherSpec.length - 1}>
                <View style={styles.cutLine}/>
              </If>
            </View>
          </For>
          <If condition={initLength <= sku_max_num}>
            <View style={styles.cutLine}/>
            <View style={{flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
              <Text style={{fontSize: 14, color: colors.color999}}>无合适规格， </Text>
              <TouchableOpacity style={{flexDirection: "row", alignItems: "center", paddingVertical: 10}} onPress={() => this.onPress(Config.ROUTE_GOODS_ADD_SPEC, {series_id: series_id})}>
                <Text style={{fontSize: 14, color: colors.main_color}}>去新增规格 </Text>
                <AntDesign name={'right'} style={{textAlign: 'center'}} color={colors.main_color} size={14}/>
              </TouchableOpacity>
            </View>
          </If>
        </View>
      </View>
    )
  }

  renderBtn = () => {
    return (
      <View style={styles.bottomBtn}>
        <Button title={'确认选择'}
                onPress={() => this.sureCheckSpec()}
                containerStyle={{flex: 1}}
                buttonStyle={styles.btn}
                titleStyle={styles.btnTitle}
        />
      </View>
    )
  }

}

const styles = StyleSheet.create({
  Content: {backgroundColor: '#F5F5F5'},
  row_fix: {flexDirection: "row", alignItems: "center"},
  InfoBox: {
    width: width * 0.94,
    marginLeft: width * 0.03,
    marginTop: pxToDp(15)
  },
  item_body: {
    backgroundColor: colors.white,
    borderRadius: 6,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: pxToDp(5)
  },
  item_row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10
  },
  item_title: {
    fontSize: 16,
    color: colors.color333,
    fontWeight: "bold"
  },
  bottomBtn: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.white,
    padding: 10
  },
  btn: {
    backgroundColor: colors.main_color,
    borderRadius: 20
  },
  btnTitle: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 22
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.e5
  },
  flexRowNormal: {flexDirection: 'row', alignItems: 'center', justifyContent: "flex-start", paddingVertical: 5},
  specSkuName: {fontSize: 12, color: colors.color333, fontWeight: "bold"},
  specSkuUpc: {fontSize: 12, color: colors.color666, marginTop: 5},
  cutLine: {width: width * 0.9, backgroundColor: colors.e5, height: 1, marginVertical: 10}
});

export default connect(mapStateToProps)(GoodsSelectSpecScence)
