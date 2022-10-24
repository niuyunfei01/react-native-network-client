import React, {PureComponent} from 'react'
import {connect} from "react-redux";
import {
  Dimensions, FlatList, Image,
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text, TouchableOpacity,
  View
} from 'react-native';
import {Button} from "react-native-elements";
import Entypo from "react-native-vector-icons/Entypo";
import {ToastShort} from "../../../pubilc/util/ToastUtils";
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import HttpUtils from "../../../pubilc/util/http";
import tool from "../../../pubilc/util/tool";
import config from "../../../pubilc/common/config";

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

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

class PermissionToIdentify extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      query: {
        page: 1,
        pageSize: 20
      },
      workerList: [],
      count: 0,
      isLastPage: false,
      isCanLoadMore: false,
      isLoading: false
    }
  }

  componentDidMount() {
    this.get_wsb_workers()
  }

  get_wsb_workers = () => {
    const {currStoreId, accessToken, vendor_id} = this.props.global;
    let {page, pageSize} = this.state.query
    const api = `/v4/wsb_worker/workerList?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api, {
      access_token: accessToken,
      store_id: currStoreId,
      vendor_id: vendor_id,
      page: page,
      page_size: pageSize
    }).then(worker_info => {
      let workers = this.state.workerList.concat(worker_info?.lists)
      this.setState({
        workerList: workers,
        query: {
          page: worker_info.page,
          pageSize: worker_info.pageSize
        },
        count: worker_info.count,
        isLastPage: worker_info.isLastPage
      })
    })
  }

  onPress(route, params = {}) {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  onRefresh = () => {
    tool.debounces(() => {
      let query = this.state.query;
      query.page = 1;
      this.setState({
        isLastPage: false,
        query: query,
        workerList: []
      }, () => {
        this.get_wsb_workers()
      })
    }, 600)
  }

  onEndReached() {
    const {query, isLastPage} = this.state;
    if (isLastPage) {
      return ToastShort('没有更多数据了')
    }
    query.page += 1
    this.setState({query}, () => {
      this.get_wsb_workers()
    })
  }

  onMomentumScrollBegin = () => {
    this.setState({
      isCanLoadMore: true
    })
  }

  addWorker = () => {
    this.onPress(config.ROUTE_ADD_ACCOUNT)
  }

  editWorker = (info) => {
    if (info?.role_store == 0) {
      ToastShort('店长不允许编辑')
      return
    }
    this.onPress(config.ROUTE_EDIT_ACCOUNT, {worker: info})
  }

  renderWorkerList = () => {
    let {workerList, isCanLoadMore, isLoading} = this.state
    return (
      <FlatList
        data={workerList}
        renderItem={this.renderWorkerItem}
        onRefresh={this.onRefresh}
        onEndReachedThreshold={0.1}
        onEndReached={() => {
          if (isCanLoadMore) {
            this.onEndReached();
            this.setState({isCanLoadMore: false})
          }
        }}
        onMomentumScrollBegin={this.onMomentumScrollBegin}
        refreshing={isLoading}
        keyExtractor={(item, index) => `${index}`}
        ListEmptyComponent={this.listEmptyComponent()}
        initialNumToRender={5}
      />
    )
  }

  renderWorkerItem = (worker) => {
    let {item} = worker
    return (
      <View style={styles.ListBox}>
        <TouchableOpacity style={styles.ListItem} onPress={() => this.editWorker(item)}>
          <View style={styles.ListItemLeft}>
            <View style={styles.workerPhoto}>
              <Text style={styles.workerDesc}>
                {item?.role_desc === '管理员' ? '店长' : item?.role_desc}
              </Text>
            </View>
            <View style={{marginLeft: pxToDp(20)}}>
              <Text style={styles.workerName}>
                {item?.name}
              </Text>
              <Text style={styles.workerPhone}>
                {item?.mobile}
              </Text>
            </View>
          </View>
          <Entypo name="chevron-thin-right" style={styles.row_right}/>
        </TouchableOpacity>
      </View>
    )
  }

  listEmptyComponent = () => {
    return (
      <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', height: 300}}>
        <If condition={!this.state.isLoading}>
          <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/%E6%9A%82%E6%97%A0%E8%AE%A2%E5%8D%95%403x.png'}}
                 style={{width: 100, height: 100, marginBottom: 20}}/>
          <Text style={{fontSize: 18, color: colors.b2}}>
            暂未设置员工信息
          </Text>
        </If>
      </View>
    )
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <FetchView navigation={this.props.navigation} onRefresh={this.get_wsb_workers}/>
        {this.renderWorkerList()}
        {this.renderBtn()}
      </View>
    );
  }

  renderBtn = () => {
    return (
      <View style={styles.bottomBtn}>
        <Button title={'添加员工'}
                onPress={() => this.addWorker()}
                containerStyle={{flex: 1}}
                buttonStyle={styles.btn}
                titleStyle={styles.btnTitle}
        />
      </View>
    )
  }

}

const styles = StyleSheet.create({
  Content: {backgroundColor: '#F5F5F5',  height: height * 0.9},
  ListBox: {
    width: width * 0.94,
    marginLeft: width * 0.03,
    marginTop: pxToDp(10)
  },
  ListItem: {
    borderRadius: pxToDp(12),
    backgroundColor: colors.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: pxToDp(5),
    padding: pxToDp(20)
  },
  ListItemLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  workerPhoto: {
    width: 44,
    height: 44,
    borderRadius: pxToDp(44),
    backgroundColor: '#F5F5F5',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  workerDesc: {
    fontSize: 14,
    color: '#42C15A',
    fontWeight: '500',
    padding: pxToDp(5)
  },
  row_right: {
    color: colors.color999,
    fontSize: 16,
  },
  workerName: {
    color: colors.color333,
    fontWeight: '500',
    fontSize: 14
  },
  workerPhone: {
    color: colors.color999,
    fontSize: 12,
    marginTop: pxToDp(5)
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
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 22
  }
});

export default connect(mapStateToProps)(PermissionToIdentify)
