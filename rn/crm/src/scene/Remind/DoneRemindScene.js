import React, {PureComponent, PropTypes} from 'react'
import {View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator} from 'react-native'
import {List, SearchBar} from "react-native-elements";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import pxToDp from '../../util/pxToDp';
import Config from '../../config'
import colors from "../../styles/colors";
import * as globalActions from '../../reducers/global/globalActions'
import Icon from 'react-native-vector-icons/FontAwesome';
import Cts from '../../Cts'
import AppConfig from '../../config'
import top_styles from './TopStyles'
import bottom_styles from './BottomStyles'
import {Icon as WeuiIcon,} from "../../weui/index";
import ModalSelector from 'react-native-modal-selector';
import selector from "../../styles/selector";

function mapStateToProps(state) {
  let {global} = state;
  return {global: global};
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}

// create a component
class DoneRemindScene extends PureComponent {

  static navigationOptions = ({navigation}) => {
    const {params, key} = navigation.state;
    return {
      headerTitle: (
        <View>
          <Text style={{color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'}}>{params.title}</Text>
        </View>
      ),
      headerStyle: {backgroundColor: colors.back_color, height: pxToDp(78)},
      headerRight: (
        <View style={{flexDirection: 'row'}}>
          <ModalSelector
            onChange={(option) => {
              params.setFilter(option.key);
            }}
            data={params.filterData}
            cancelText="取消"
            selectStyle={selector.selectStyle}
            selectTextStyle={selector.selectTextStyle}
            overlayStyle={selector.overlayStyle}
            sectionStyle={selector.sectionStyle}
            sectionTextStyle={selector.sectionTextStyle}
            optionContainerStyle={selector.optionContainerStyle}
            optionStyle={selector.optionStyle}
            optionTextStyle={selector.optionTextStyle}
            cancelStyle={selector.cancelStyle}
            cancelTextStyle={selector.cancelTextStyle}>
            <Icon name='ellipsis-h' style={{
              fontSize: pxToDp(40),
              width: pxToDp(42),
              height: pxToDp(36),
              color: colors.color666,
              marginRight: pxToDp(30),
            }}/>
          </ModalSelector>
        </View>),
    }
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      dataSource: [],
      filterData: [{key: 1, label: '近一个月'}, {key: 2, label: '近三个月'}, {key: 0, label: '全部'}],
      loading: false,
      page: 1,
      seed: 1,
      error: null,
      filter: 0,
      search: '',
      refreshing: false,
    };
  }

  componentWillMount() {
    this.makeRemoteRequest();
  }

  componentDidMount() {
    this.props.navigation.setParams({filterData: this.state.filterData, setFilter: this.setFilter.bind(this)});
  }

  setFilter(val) {
    this.setState({filter: val});
    this.onRefresh();
  }

  makeRemoteRequest = () => {
    const {global} = this.props;
    const {page, filter, search} = this.state;
    this.setState({loading: true});
    const token = global['accessToken'];
    const _this = this;
    const url = AppConfig.ServiceUrl + 'api/list_notice/-1/' + Cts.TASK_STATUS_DONE + '/' + page + '.json?access_token=' + token + '&search=' + search + '&time_range=' + filter;
    console.info("fetch remind url ", url);
    fetch(url)
      .then(res => res.json())
      .then(res => {
        _this.setState({
          dataSource: page === 1 ? res.obj.list : [..._this.state.dataSource, ...res.obj.list],
          error: res.ok ? null : res.reason,
          loading: false,
          refreshing: false
        });
      })
      .catch(error => {
        _this.setState({error: error, loading: false});
      });
  };

  _shouldItemUpdate = (prev, next) => {
    return prev.item !== next.item;
  }

  _getItemLayout = (data, index) => {
    return {length: pxToDp(250), offset: pxToDp(250) * index, index}
  }

  _keyExtractor = (item) => {
    return item.id.toString();
  }

  onEndReached() {
    this.setState(
      {
        page: this.state.page + 1
      },
      () => {
        this.makeRemoteRequest();
      }
    );
  }

  onPress(route, params) {
    this.props.navigation.navigate(route, params);
  }

  renderItem(remind) {
    let {item, index} = remind;
    return (<Item item={item} index={index} key={index} onPress={this.onPress.bind(this)}/>);
  }

  onRefresh() {
    this.setState(
      {
        page: 1,
        seed: this.state.seed + 1,
        refreshing: true
      },
      () => {
        this.makeRemoteRequest();
      }
    );
  }

  renderFooter() {
    if (!this.state.loading) return null;
    if (this.state.refreshing) return null;
    return (
      <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator styleAttr='Inverse' color='#3e9ce9'/>
        <Text style={{textAlign: 'center', fontSize: 16}}>
          加载中…
        </Text>
      </View>
    );
  }

  renderEmpty() {
    if (this.state.loading) {
      return null;
    } else {
      return (<View style={{
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'row',
        height: pxToDp(600)
      }}>
        <Text style={{fontSize: 18}}>
          没有数据...
        </Text>
      </View>);
    }
  }

  render() {
    return (
      <List style={styles.wrapper}>
        <SearchBar placeholder="请输入搜索内容" lightTheme round
                   ref={search => this.search = search}
                   onChangeText={(search) => {
                     this.setState({search: search});
                     this.onRefresh();
                   }}/>
        <FlatList
          extraData={this.state.dataSource}
          data={this.state.dataSource}
          legacyImplementation={false}
          directionalLockEnabled={true}
          viewabilityConfig={{
            minimumViewTime: 3000,
            viewAreaCoveragePercentThreshold: 100,
            waitForInteraction: true,
          }}
          onEndReachedThreshold={0.1}
          renderItem={this.renderItem.bind(this)}
          onEndReached={this.onEndReached.bind(this)}
          onRefresh={this.onRefresh.bind(this)}
          refreshing={this.state.refreshing}
          ListFooterComponent={this.renderFooter.bind(this)}
          keyExtractor={this._keyExtractor}
          shouldItemUpdate={this._shouldItemUpdate}
          getItemLayout={this._getItemLayout}
          ListEmptyComponent={this.renderEmpty.bind(this)}
          initialNumToRender={5}
        />
      </List>
    );
  }
}

class Item extends PureComponent {
  static propTypes = {
    item: PropTypes.object,
    index: PropTypes.number,
    onPress: PropTypes.func
  };

  constructor() {
    super();
  }

  render() {
    let {item, onPress} = this.props;
    return (
      <TouchableOpacity onPress={() => onPress(Config.ROUTE_ORDER, {orderId: item.order_id})} activeOpacity={0.6}>
        <View style={top_styles.container}>
          <View style={[top_styles.order_box]}>
            <View style={top_styles.box_top}>
              <View style={[top_styles.order_head]}>
                <View>
                  <Text style={top_styles.o_index_text}>{item.orderDate}#{item.dayId}</Text>
                </View>
                <View>
                  <Text style={top_styles.o_store_name_text}>{item.store_id}</Text>
                </View>
                <View style={top_styles.tag_right}><Text>送达</Text></View>
              </View>
              <View style={[top_styles.order_body]}>
                <Text style={[top_styles.order_body_text]}>
                  <Text style={top_styles.o_content}>
                    {item.remark}
                  </Text>
                </Text>
                <View style={[top_styles.ship_status]}>
                  <Text style={[top_styles.ship_status_text]}>{item.orderStatus}</Text>
                </View>
              </View>
            </View>
            <View style={bottom_styles.container}>
              <View style={bottom_styles.time_date}>
                <Text style={bottom_styles.time_date_text}>{item.noticeDate}</Text>
              </View>
              <View>
                <Text style={bottom_styles.time_start}>{item.noticeTime}</Text>
              </View>
              {!!item.resolved_at && <View style={{marginLeft: pxToDp(20)}}>
                <Text style={bottom_styles.time_date_text}>{item.resolved_at}解决</Text>
              </View>}
              {!!item.resolved_at && <WeuiIcon name="success_no_circle" style={{fontSize: 16}}/>}
              {!!item.resolved_by && <View style={bottom_styles.operator}>
                <Text style={bottom_styles.operator_text}>
                  处理人：{item.resolved_by}
                </Text>
              </View>
              }
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    borderTopWidth: 0,
    borderBottomWidth: 0
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(DoneRemindScene)
