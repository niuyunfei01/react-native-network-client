import React from "react";
import {
  Dimensions,
  FlatList,
  InteractionManager,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import tool from "../../pubilc/util/tool";
import {Badge} from "react-native-elements";
import colors from "../../pubilc/styles/colors";
import HttpUtils from "../../pubilc/util/http";
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import {connect} from "react-redux";
import NoticeItem from "./NoticeItem";

const {width} = Dimensions.get("window");

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class NoticeList extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: false,
      categoryLabels: [
        {tabname: '退款', num: 0, status: 100},
        {tabname: '配送', num: 0, status: 101},
        {tabname: '售后', num: 0, status: 102},
        {tabname: '其他', num: 0, status: 103},
        {tabname: '已处理', num: 0, status: -1},
      ],
      typeLabels: [
        {tabname: '其他', num: 0, type: 3},
        {tabname: '商品上传失败', num: 0, type: 8},
        {tabname: '未归类', num: 0, type: 0},
        {tabname: '新商品申请', num: 0, type: 9},
        {tabname: '调价', num: 0, type: 200},
      ],
      queryParams: {
        page: 1,
        isAdd: true,
      },
      checkStatus: 100,
      checkType: 3,
      list: [],
      isCanLoadMore: false,
    }
  }

  UNSAFE_componentWillMount() {
  }

  componentWillUnmount() {
    this.focus()
  }

  componentDidMount() {
    this.fetchData(100)

    this.focus = this.props.navigation.addListener('focus', () => {
      this.fetchData()
    })
  }


  fetchData = (paramsStatus, setList = 1) => {
    if (setList === 1) this.fetchNum();
    let {store_id, accessToken} = this.props.global;
    let {currVendorId} = tool.vendor(this.props.global);
    let {queryParams, checkStatus, list} = this.state;
    let QueryStatus = paramsStatus || checkStatus;
    let status = QueryStatus === -1 ? 1 : 0;
    this.setState({
      checkStatus: [100, 101, 102, 103, -1].indexOf(QueryStatus) === -1 ? checkStatus : QueryStatus,
      isLoading: true,
    })
    const url = `/api/list_notice/${currVendorId}/${store_id}/${QueryStatus}/${status}/${queryParams.page}?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(url, {}).then(res => {
      if (tool.length(res.list) < 10) {
        queryParams.isAdd = false;
      }
      queryParams.page++;
      this.setState({
        list: setList === 1 ? res.list : list.concat(res.list),
        isLoading: false,
        queryParams,
      })
    })
  }

  fetchNum = () => {
    let {store_id, accessToken} = this.props.global;
    let {currVendorId} = tool.vendor(this.props.global);
    let {categoryLabels, typeLabels} = this.state;
    let that = this;
    const url = `/api/list_notice_count/${currVendorId}/${store_id}?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(url, {}).then(res => {
      tool.objectMap(res.result, (item, idx) => {
        categoryLabels.forEach((itm, key) => {
          if (itm.status === Number(idx)) {
            that.state.categoryLabels[key].num = item.quick
          }
        })
      })
      tool.objectMap(res.quick_type_num, (item, idx) => {
        typeLabels.forEach((itm, key) => {
          if (itm.type === Number(idx)) {
            that.state.typeLabels[key].num = item
          }
        })
      })
    })
  }

  onRefresh = (checkStatus = 100) => {
    let that = this;
    tool.debounces(() => {
      if (this.state.isLoading) {
        that.state.isLoading = true;
        return null;
      }
      if (checkStatus === 103) {
        that.state.checkType = 3;
      }
      that.state.queryParams.page = 1;
      that.state.queryParams.isAdd = true;
      this.fetchData(checkStatus)
    }, 600)
  }

  setType = (Type) => {
    let that = this;
    tool.debounces(() => {
      if (this.state.isLoading) {
        that.state.isLoading = true;
        return null;
      }
      that.state.queryParams.page = 1;
      that.state.queryParams.isAdd = true;
      this.setState({
        checkType: Type
      }, () => {
        this.fetchData(Type)
      })
    }, 600)

  }

  listmore = () => {
    let {queryParams, checkStatus} = this.state
    if (queryParams.isAdd) {
      this.fetchData(checkStatus, 0);
    }
  }

  _shouldItemUpdate = (prev, next) => {
    return prev.item !== next.item;
  }

  _getItemLayout = (data, index) => {
    return {length: 100, offset: 100 * index, index}
  }

  onTouchMove = (e) => {
    this.setState({scrollLocking: Math.abs(this.pageY - e.nativeEvent.pageY) > Math.abs(this.pageX - e.nativeEvent.pageX)});
  }

  onPress = (route, params) => {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        {this.renderStatusTabs()}
        {this.renderTypeTabs()}
        {this.renderContent()}
      </View>
    );
  }

  renderStatusTabs = () => {
    let {categoryLabels, checkStatus} = this.state
    if (!tool.length(categoryLabels) > 0) {
      return null;
    }
    return (
      <View style={styles.statusTab}>
        <For index="i" each='tab' of={categoryLabels}>
          <TouchableOpacity
            key={i}
            style={{width: width / tool.length(categoryLabels), alignItems: "center"}}
            onPress={() => {
              this.onRefresh(tab.status)
            }}>
            <View style={styles.statusTabItem}>
              <Text style={[styles.f14c33, {fontWeight: checkStatus === tab.status ? "bold" : "normal"}]}>
                {tab.tabname}
              </Text>
              <If condition={tab.num > 0}>
                <Badge
                  status="error"
                  value={tab.num > 99 ? '99+' : tab.num}
                  containerStyle={styles.statusTabBadge}/>
              </If>
            </View>
            <If condition={checkStatus === tab.status}>
              <View style={styles.statusTabRight}/>
            </If>
          </TouchableOpacity>
        </For>
      </View>
    )
  }

  renderTypeTabs = () => {
    let {typeLabels, checkType, checkStatus} = this.state
    if (!tool.length(typeLabels) > 0 || checkStatus !== 103) {
      return null;
    }
    return (
      <View style={styles.typeTab}>
        <ScrollView
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          horizontal={true}>
          <For index="i" each='tab' of={typeLabels}>
            <TouchableOpacity
              key={i}
              style={{
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 10,
                backgroundColor: checkType === tab.type ? colors.main_color : colors.white,
                borderRadius: 6,
                marginLeft: 6,
              }}
              onPress={() => {
                this.setType(tab.type)
              }}>
              <View style={styles.typeItem}>
                <Text style={[styles.f14c33, {color: checkType === tab.type ? colors.white : colors.color333}]}>
                  {tab.tabname}
                </Text>
                <If condition={tab.num > 0}>
                  <Badge
                    status="error"
                    value={tab.num > 99 ? '99+' : tab.num}
                    containerStyle={styles.typeTabBadge}/>
                </If>
              </View>
              <If condition={checkType === tab.type}>
                <View style={styles.statusTabRight}/>
              </If>
            </TouchableOpacity>
          </For>
          <View style={{width: 40}}/>
        </ScrollView>
      </View>
    )
  }


  renderContent = () => {
    let {isCanLoadMore, isLoading, list} = this.state
    return (
      <SafeAreaView style={styles.orderListContent}>
        <FlatList
          extraData={list}
          data={list}
          legacyImplementation={false}
          directionalLockEnabled={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          onTouchStart={(e) => {
            this.pageX = e.nativeEvent.pageX;
            this.pageY = e.nativeEvent.pageY;
          }}
          onEndReachedThreshold={0.3}
          onEndReached={() => {
            if (isCanLoadMore) {
              this.setState({isCanLoadMore: false}, () => this.listmore())
            }
          }}
          onMomentumScrollBegin={() => {
            this.setState({isCanLoadMore: true})
          }}
          onTouchMove={(e) => this.onTouchMove(e)}
          renderItem={this.renderItem}
          onRefresh={this.onRefresh.bind(this)}
          refreshing={isLoading}
          keyExtractor={(item, index) => `${index}`}
          shouldItemUpdate={this._shouldItemUpdate}
          getItemLayout={this._getItemLayout}
          ListEmptyComponent={this.renderEmptyData()}
          initialNumToRender={5}
        />
      </SafeAreaView>
    );
  }


  renderItem = (data) => {
    let {item, index} = data;
    return (
      <NoticeItem key={index}
                  item={item}
                  accessToken={this.props.global.accessToken}
                  fetchData={this.onRefresh.bind(this)}
                  onPress={this.onPress.bind(this)}/>
    );
  }

  renderEmptyData = () => {
    return (
      <View style={styles.noOrderContent}>
        <Text style={styles.noOrderDesc}>暂无数据</Text>
      </View>
    )
  }
}


const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.f2,
  },
  orderListContent: {flex: 1},
  statusTab: {flexDirection: 'row', justifyContent: 'center', backgroundColor: colors.white},
  typeTab: {flexDirection: 'row', height: 50, alignItems: 'center'},
  typeItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTabItem: {
    borderColor: colors.main_color,
    height: 40,
    justifyContent: 'center',
  },
  f14c33: {
    color: colors.color333,
    fontSize: 14
  },
  statusTabBadge: {position: 'absolute', top: 1, right: -20},
  typeTabBadge: {position: 'absolute', top: -10, right: -10},
  statusTabRight: {height: 2, width: 24, backgroundColor: colors.main_color},
  noOrderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 210
  },
  noOrderDesc: {fontSize: 18, color: colors.b2},
});

export default connect(mapStateToProps, mapDispatchToProps)(NoticeList)
