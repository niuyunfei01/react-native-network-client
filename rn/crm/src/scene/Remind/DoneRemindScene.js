import React, {PureComponent} from 'react'
import {View, Text, StyleSheet, ScrollView} from 'react-native'
import {List, SearchBar, ListItem} from "react-native-elements";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import pxToDp from '../../util/pxToDp';
import Text from "../../weui/Text/index";
import {top_styles, bottom_styles} from "./RemindStyle"
import Config from '../../config'
import {FetchDoneRemind} from '../../services/remind'
import colors from "../../styles/colors";
import * as globalActions from '../../reducers/global/globalActions'
import Icon from 'react-native-vector-icons/FontAwesome';

function mapStateToProps(state) {
  return {global} = state;
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
    const {params = {}, key} = navigation.state;

    return {
      headerTitle: (
        <View>
          <Text style={{color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'}}>{params.tag}</Text>
        </View>
      ),
      headerStyle: {backgroundColor: colors.back_color, height: pxToDp(78)},
      headerRight: (
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity onPress={() => {
          }}>
            <Icon name='fa-ellipsis-h' style={{
              fontSize: pxToDp(40),
              width: pxToDp(42),
              height: pxToDp(36),
              color: colors.color666,
              marginRight: pxToDp(30),
            }}/>
          </TouchableOpacity>
        </View>),
    }
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      dataSource: [],
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

  makeRemoteRequest = () => {
    const {global} = this.props;
    const {page, seed} = this.state;
    this.setState({loading: true});
    const token = global['accessToken'];
    FetchDoneRemind(token, page).then(res => res.json())
      .then(res => {
        this.setState({
          data: page === 1 ? res.results : [...this.state.dataSource, ...res.results],
          error: res.error || null,
          loading: false,
          refreshing: false
        });
      }).catch(error => {
      this.setState({error, loading: false});
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
    return (
      <Item item={item} index={index} key={index} onPress={this.onPress.bind(this)}/>
    );
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
    return (
      <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator styleAttr='Inverse' color='#3e9ce9'/>
        <Text style={{textAlign: 'center', fontSize: 16}}>
          加载中…
        </Text>
      </View>
    );
  }

  render() {
    return (
      <List style={styles.wrapper}>
        <SearchBar placeholder="请输入搜索内容" lightTheme round/>
        <FlatList
          extraData={this.state.dataSource}
          data={dataSource}
          legacyImplementation={false}
          directionalLockEnabled={true}
          viewabilityConfig={{
            minimumViewTime: 3000,
            viewAreaCoveragePercentThreshold: 100,
            waitForInteraction: true,
          }}
          onEndReachedThreshold={0.1}
          renderItem={this.renderItem}
          onEndReached={this.onEndReached}
          onRefresh={this.onRefresh}
          refreshing={this.state.refreshing}
          ListFooterComponent={this.renderFooter}
          keyExtractor={this._keyExtractor}
          shouldItemUpdate={this._shouldItemUpdate}
          getItemLayout={this._getItemLayout}
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
    let {item, index, onPress} = this.props;
    return (
      <ListItem onPress={() => onPress(Config.ROUTE_ORDER, {orderId: item.order_id})} activeOpacity={0.6}>
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
                <View><Text>送达</Text></View>
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
                <Text style={bottom_styles.time_start}>{item.noticeTime}生成</Text>
              </View>
              <View>
                <Text style={bottom_styles.time_end}>{item.expect_end_time}</Text>
              </View>
              <View style={bottom_styles.operator}>
                <Text style={bottom_styles.operator_text}>
                  处理人：{item.delegation_to_user}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ListItem>
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
