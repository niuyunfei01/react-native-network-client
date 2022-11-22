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
      checkedSpec: {}
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
    let {series_id, store_id} = this.state;
    const api = `/v1/new_api/store_product/product_sku_list/${store_id}/${series_id}`
    HttpUtils.get.bind(this.props)(api, {
      access_token: accessToken
    }).then(res => {
      this.setState({
        currentSpecs: res?.skus,
        otherSpec: res?.no_skus
      })
    })
  }

  touchOtherSpecItem = (idx, info) => {
    let menus = [...this.state.otherSpec]
    menus.forEach(item => {
      item.checked = false
    })
    menus[idx].checked = true
    this.setState({
      otherSpec: menus,
      checkedSpec: info
    })
  }

  sureCheckSpec = () => {
    let {checkedSpec} = this.state;
    this.props.route.params.onBack(checkedSpec)
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
      currentSpecs, otherSpec, series_id
    } = this.state
    return (
      <View style={styles.InfoBox}>
        <View style={styles.item_body}>
          <View style={styles.item_row}>
            <Text style={styles.item_title}>当前使用的规格 </Text>
          </View>
          <For of={currentSpecs} each="info" index="idx">
            <View style={styles.flexRowNormal} key={idx}>
              <View>
                <Text style={styles.specSkuName}>{info.sku_name} </Text>
                <Text style={styles.specSkuUpc}>upc: {info.upc} </Text>
              </View>
            </View>
            <If condition={currentSpecs.length - 1 !== idx}>
              <View style={styles.cutLine}/>
            </If>
          </For>
        </View>
        <View style={styles.item_body}>
          <View style={styles.item_row}>
            <Text style={styles.item_title}>其他规格 </Text>
          </View>
          <For of={otherSpec} each="info" index="idx">
            <TouchableOpacity style={styles.flexRowNormal} key={idx} onPress={() => this.touchOtherSpecItem(idx, info)}>
              <CheckBox
                checked={info.checked}
                checkedColor={colors.main_color}
                checkedIcon='dot-circle-o'
                uncheckedIcon='circle-o'
                uncheckedColor='#979797'
                size={18}
                onPress={() => this.touchOtherSpecItem(idx, info)}
              />
              <View>
                <Text style={styles.specSkuName}>{info.sku_name} </Text>
                <Text style={styles.specSkuUpc}>upc: {info.upc} </Text>
              </View>
            </TouchableOpacity>
            <View style={styles.cutLine}/>
          </For>
          <View style={{flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
            <Text style={{fontSize: 14, color: colors.color999}}>无合适规格， </Text>
            <TouchableOpacity style={{flexDirection: "row", alignItems: "center", paddingVertical: 10}}
                              onPress={() => this.onPress(Config.ROUTE_GOODS_ADD_SPEC, {series_id: series_id})}>
              <Text style={{fontSize: 14, color: colors.main_color}}>去新增规格 </Text>
              <AntDesign name={'right'} style={{textAlign: 'center'}} color={colors.main_color} size={14}/>
            </TouchableOpacity>
          </View>
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
