import React from "react";
import {
  Dimensions, FlatList,
  InteractionManager,
  StyleSheet,
  Text, TouchableOpacity,
  View
} from "react-native";
import colors from "../../pubilc/styles/colors";
import {SvgXml} from "react-native-svg";
import {down, no_message, no_network, set} from "../../svg/svg";
import tool from "../../pubilc/util/tool";
import {ToastShort} from "../../pubilc/util/ToastUtils";
import LinearGradient from "react-native-linear-gradient";
import NetInfo from "@react-native-community/netinfo";
import TopSelectModal from "../../pubilc/component/TopSelectModal";
import HttpUtils from "../../pubilc/util/http";
import {connect} from "react-redux";
import Config from "../../pubilc/common/config";

const mapStateToProps = ({global}) => ({global: global})

const {width} = Dimensions.get("window");
const tabOption = [
  {label: '全部', key: 'all'},
  {label: '已读', key: 'read'},
  {label: '未读', key: 'unread'}
]

class NoticeList extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      selected: 'all',
      message: [],
      isLoading: false,
      isCanLoadMore: false,
      query: {
        page: 0,
        page_size: 20
      },
      isLastPage: false,
      netWorkStatus: 'offline',
      selectStoreVisible: false,
      storeList: [],
      page_size: 10,
      page: 1,
      is_last_page: false,
      refreshing: false,
      show_select_store: true,
      store_name: props.global?.store_info?.name,
      store_id: props.global?.store_id
    }
  }

  componentDidMount() {
    this.getStoreList()
    this.focus = this.props.navigation.addListener('focus', () => {
      this.fetchData()
    })
    NetInfo.fetch().then(state => {
      this.setState({
        netWorkStatus: state.isConnected
      })
    });
    NetInfo.addEventListener(
      this.handleFirstConnectivityChange.bind(this)
    );
  }

  componentWillUnmount() {
    this.focus()
  }

  handleFirstConnectivityChange(netWorkStatus) {
    this.setState(netWorkStatus)
  }

  onPress = (route, params) => {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  getStoreList = () => {
    const {accessToken, only_one_store} = this.props.global;
    const {page_size, page, storeList, is_last_page, show_select_store} = this.state
    if (only_one_store || is_last_page || !show_select_store)
      return
    let params = {
      page: page,
      page_size: page_size
    }
    this.setState({refreshing: true})
    const api = `/v4/wsb_store/listCanReadStore?access_token=${accessToken}`
    HttpUtils.get(api, params).then(res => {
      const {lists, page, isLastPage} = res
      if (page === 1) {
        lists.shift()
      }
      let list = page !== 1 ? storeList.concat(lists) : lists
      this.setState({
        storeList: list,
        page: page + 1,
        refreshing: false,
        is_last_page: isLastPage
      })
    }).catch(() => {
      this.setState({refreshing: false})
    })
  }

  fetchData = () => {
    const {accessToken, store_id} = this.props.global;
    const {query, isLastPage, selected, message} = this.state
    if (isLastPage)
      return
    let params = {
      page: query.page,
      page_size: query.page_size,
      status: selected
    }
    this.setState({refreshing: true})
    const api = `/api/get_im_lists?store_id=${store_id}&access_token=${accessToken}`
    HttpUtils.get(api, params).then(res => {
      const {lists, page, isLastPage} = res
      let list = page !== 1 ? message.concat(lists) : lists
      this.setState({
        message: list,
        refreshing: false,
        isLastPage: isLastPage
      })
    }).catch(() => {
      this.setState({refreshing: false})
    })
  }

  onRefresh = () => {
    tool.debounces(() => {
      let query = this.state.query;
      query.page = 0;
      this.setState({
        isLastPage: false,
        query: query,
        message: []
      }, () => {
        this.fetchData()
      })
    }, 600)
  }

  onEndReached() {
    const {query, isLastPage} = this.state;
    if (isLastPage) {
      ToastShort('没有更多数据了')
      return null
    }
    query.page += 1
    this.setState({query}, () => {
      this.fetchData()
    })
  }

  onMomentumScrollBegin = () => {
    this.setState({
      isCanLoadMore: true
    })
  }

  listEmptyComponent = () => {
    return (
      <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, height: 200}}>
        <SvgXml xml={no_message(120, 90)}/>
        <Text style={{fontSize: 15, color: colors.color999, marginTop: 10}}>
          暂无消息
        </Text>
      </View>
    )
  }

  networkEmptyComponent = () => {
    return (
      <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, height: 200}}>
        <SvgXml xml={no_network(120, 90)}/>
        <Text style={{fontSize: 15, color: colors.color999, marginTop: 10}}>
          无网络链接，请检查您设备的网络链接
        </Text>
      </View>
    )
  }

  selectStore = () => {
    let {show_select_store} = this.state;
    if (show_select_store) {
      this.setState({
        selectStoreVisible: true
      })
    }
  }

  setStoreInfo = (item) => {
    const {name, id} = item
    this.setState({store_name: name, store_id: id, selectStoreVisible: false}, () => this.fetchData())
  }

  navigationToChatRoom = (info) => {
    this.onPress(Config.ROUTE_CHAT_ROOM, {info: info})
  }

  renderHead = () => {
    let {store_name, show_select_store} = this.state;
    const {only_one_store} = this.props.global;
    return (
      <View style={styles.head}>
        <TouchableOpacity style={styles.headLeft}
          onPress={() => this.selectStore()}
        >
          <Text style={styles.headLeftTitle}>{store_name} </Text>
          <If condition={!only_one_store && show_select_store}>
            <SvgXml xml={down(20, 20, colors.color666)}/>
          </If>
        </TouchableOpacity>
        <SvgXml onPress={() => this.onPress(Config.ROUTE_IM_SETTING)} xml={set(34, 34, colors.white)}/>
      </View>
    )
  }

  renderTab = () => {
    let {selected} = this.state;
    return (
      <View style={styles.tab}>
        <For of={tabOption} each="info" index="i">
          <TouchableOpacity
            style={[styles.tabItem, {borderBottomWidth: selected === info.key ? 2 : 0, borderBottomColor: selected === info.key ? colors.main_color : colors.white}]}
            onPress={() => {
              let query = this.state.query;
              query.page = 1;
              this.setState({
                selected: info.key,
                query: query,
                isLastPage: false
              }, () => {
                this.fetchData()
              })
            }}
            key={i}
          >
            <Text style={{color: selected === info.key ? colors.main_color : colors.color333, fontWeight: selected === info.key ? "bold" : "400"}}>{info.label} </Text>
          </TouchableOpacity>
        </For>
      </View>
    )
  }

  renderMessage = () => {
    let {message, isCanLoadMore, isLoading} = this.state;
    return (
      <FlatList
        style={[styles.message, {backgroundColor: message.length > 0 ? colors.white : colors.f5}]}
        data={message}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        renderItem={this.renderList}
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
        initialNumToRender={7}
      />
    )
  }

  renderList = (info) => {
    let {message} = this.state
    let {item, index} = info
    return (
      <TouchableOpacity style={[styles.messageItem, {borderBottomWidth: index == message.length - 1 ? 0 : 1, borderBottomColor: colors.e5}]} onPress={() => this.navigationToChatRoom(item)}>
        <If condition={item?.is_read == '1'}>
          <View style={styles.isReadIcon}/>
        </If>
        <View style={styles.profile}>
          <Text style={styles.profileName}>{item?.userName?.substring(0, 1)}</Text>
        </View>
        <View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item?.userName} {item?.dayId !== '' ? `#${item?.dayId}` : ''} </Text>
            <Text style={styles.messageTime}>{item.send_time} </Text>
          </View>
          <Text style={styles.storeInfo}>{item.ext_store_name} {item?.platform_dayId !== '' ? `#${item?.platform_dayId}` : ''}</Text>
          <Text style={styles.messageInfo}>{item.msg_type === '1' ? tool.jbbsubstr(item?.last_message, 20) : `[图片]`} </Text>
        </View>
      </TouchableOpacity>
    )
  }

  renderEmptyText = () => {
    return (
      <Text style={styles.noMore}>-没有更多消息啦- </Text>
    )
  }

  renderFloatIcon = () => {
    return (
      <TouchableOpacity style={styles.floatBox} onPress={() => this.onPress('Home')}>
        <LinearGradient
          style={styles.floatIcon}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          colors={['#47D763', '#26B942']}>
          <Text style={styles.floatText}>旧版消息</Text>
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  renderSelectStore = () => {
    let {store_id} = this.props.global;
    let {selectStoreVisible, storeList, refreshing} = this.state;
    return (
      <TopSelectModal visible={selectStoreVisible} marTop={40}
                      list={storeList}
                      label_field={'name'}
                      value_field={'id'}
                      default_val={store_id}
                      onEndReachedThreshold={0.3}
                      onEndReached={this.getStoreList}
                      refreshing={refreshing}
                      initialNumToRender={10}
                      onPress={(item) => this.setStoreInfo(item)}
                      onClose={() => this.setState({selectStoreVisible: false})}/>
    )
  }

  render() {
    let {netWorkStatus, isLastPage} = this.state;
    return (
      <View style={styles.mainContainer}>
        {this.renderHead()}
        {this.renderTab()}
        {netWorkStatus ?
          this.renderMessage() : this.networkEmptyComponent()
        }
        <If condition={isLastPage}>
          {this.renderEmptyText()}
        </If>
        {this.renderFloatIcon()}
        {this.renderSelectStore()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: colors.f5,
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: colors.white,
    paddingHorizontal: 12
  },
  headLeft: {
    height: 44,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    marginLeft: 50
  },
  headLeftTitle: {
    fontSize: 15,
    color: colors.color333,
    fontWeight: 'bold'
  },
  tab: {
    backgroundColor: colors.white,
    height: 40,
    width: width,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center"
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    height: 40
  },
  message: {
    width: width * 0.94,
    padding: 10,
    borderRadius: 10,
    marginVertical: 10
  },
  messageItem: {
    flexDirection: "row",
    padding: 6,
    marginTop: 10
  },
  profile: {
    width: 40,
    height: 40,
    backgroundColor: colors.f5,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  isReadIcon: {width: 8, height: 8, backgroundColor: '#FF442F', borderRadius: 4, position: "absolute", top: 8, left: 40, zIndex: 999},
  profileName: {
    color: colors.main_color,
    fontSize: 15
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: width * 0.74
  },
  userName: {
    fontSize: 16,
    color: colors.color333,
    fontWeight: "bold"
  },
  userBoxTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  messageTime: {
    fontSize: 12,
    color: colors.color999
  },
  storeInfo: {
    fontSize: 12,
    color: colors.color666,
    marginTop: 5
  },
  messageInfo: {
    fontSize: 14,
    color: colors.color999,
    marginVertical: 10
  },
  noMore: {
    fontSize: 14,
    color: colors.color999,
    marginBottom: 10
  },
  floatBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    padding: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.3,
    elevation: 5,
    shadowRadius: 26,
    zIndex: 999,
    position: "absolute",
    bottom: 10,
    right: 10
  },
  floatText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.white
  },
  floatIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    padding: 10,
    alignItems: "center"
  }
});

export default connect(mapStateToProps)(NoticeList)
