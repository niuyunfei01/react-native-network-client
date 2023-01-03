import React, {PureComponent} from "react";
import {View, ScrollView, StyleSheet, TouchableOpacity, Text, InteractionManager} from "react-native";
import {connect} from "react-redux";
import {SvgXml} from "react-native-svg";
import {back, down} from "../../../../svg/svg";
import colors from "../../../../pubilc/styles/colors";
import RevenueDataComponent from "./RevenueDataComponent";
import DeliveryDataComponent from "./DeliveryDataComponent";
import PlatformDataComponent from "./PlatformDataComponent";
import ProfitAndLossComponent from "./ProfitAndLossComponent";
import Config from "../../../../pubilc/common/config";

const styles = StyleSheet.create({
  headerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: 6,
  },
  headerTextWrap: {flexDirection: 'row', alignItems: 'center'},
  headerText: {
    color: colors.color333,
    fontSize: 17,
    fontWeight: 'bold',
    lineHeight: 24,
    marginRight: 4,
    textAlign: 'center'
  },
  categoryWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    marginBottom: 10
  },
  notSelectCategoryWrap: {},
  selectedCategoryWrap: {
    borderBottomColor: colors.main_color,
    borderBottomWidth: 2,
    borderRadius: 1.5
  },
  notSelectCategoryText: {
    fontSize: 14,
    color: colors.color666,
    lineHeight: 20,
    paddingVertical: 8
  },
  selectedCategoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.main_color,
    lineHeight: 20,
    paddingVertical: 8
  },
})

const CATEGORY_LIST = [
  {
    index: 0,
    name: '营收'
  },
  {
    index: 1,
    name: '配送'
  },
  {
    index: 2,
    name: '平台'
  },
  {
    index: 3,
    name: '盈亏'
  },
]

class BusinessDataScene extends PureComponent {

  state = {
    store_id: this.props.global?.store_id,
    store_name: this.props.global?.store_info?.name,
    selectCategory: 0,
  }

  onPress = (route, params) => {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }
  selectStore = () => {
    this.onPress(Config.ROUTE_STORE_SELECT, {onBack: (item) => this.setStoreInfo(item)})

  }
  renderHeader = () => {
    let {store_name} = this.state;
    const {only_one_store} = this.props.global;
    return (
      <View style={styles.headerWrap}>
        <SvgXml height={32}
                width={32}
                onPress={() => this.props.navigation.goBack()}
                xml={back()}/>
        <If condition={!only_one_store}>
          <TouchableOpacity style={styles.headerTextWrap} onPress={() => this.selectStore()}>
            <Text style={styles.headerText}>{store_name}</Text>
            <SvgXml xml={down(20, 20, colors.color333)}/>
          </TouchableOpacity>
        </If>
        <If condition={only_one_store}>
          <Text style={styles.headerText}>经营数据</Text>
        </If>
        <View/>
      </View>
    )
  }
  setStoreInfo = (item) => {
    const {name, id} = item
    this.setState({store_name: name, store_id: id})
  }

  setCategory = (index) => {
    this.setState({selectCategory: index})
  }
  renderCategory = () => {
    const {selectCategory} = this.state
    return (
      <View style={styles.categoryWrap}>
        {
          CATEGORY_LIST.map((item, index) => {
            return (
              <TouchableOpacity key={index}
                                onPress={() => this.setCategory(index)}
                                style={selectCategory === index ? styles.selectedCategoryWrap : styles.notSelectCategoryWrap}>
                <Text style={selectCategory === index ? styles.selectedCategoryText : styles.notSelectCategoryText}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )
          })
        }
      </View>
    )
  }

  renderContent = () => {
    const {selectCategory, store_id, store_name} = this.state
    const {accessToken} = this.props.global
    const {navigation} = this.props
    switch (selectCategory) {
      case 0:
        return <RevenueDataComponent store_id={store_id} accessToken={accessToken} navigation={navigation}/>
      case 1:
        return <DeliveryDataComponent store_id={store_id} accessToken={accessToken} navigation={navigation}/>
      case 2:
        return <PlatformDataComponent store_id={store_id} accessToken={accessToken} navigation={navigation}/>
      case 3:
        return <ProfitAndLossComponent store_id={store_id}
                                       accessToken={accessToken}
                                       store_name={store_name}
                                       navigation={navigation}/>
      default:
        return null
    }
  }

  render() {

    return (
      <>
        {this.renderHeader()}
        {this.renderCategory()}
        <ScrollView>
          {this.renderContent()}
        </ScrollView>
      </>
    );
  }
}

const mapStateToProps = ({global}) => ({global: global})
export default connect(mapStateToProps)(BusinessDataScene)
