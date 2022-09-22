//import liraries
import React, {PureComponent} from 'react'
import {
  Image,
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import {Cell, CellBody, CellFooter, CellHeader, Cells, CellsTitle,} from "../../../weui";
import Icon from 'react-native-vector-icons/MaterialIcons';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import {fetchUserCount, fetchWorkers} from "../../../reducers/mine/mineActions";
import Config from "../../../pubilc/common/config";
import Button from 'react-native-vector-icons/Entypo';
import {NavigationActions} from '@react-navigation/compat';
import CallBtn from "../../order/CallBtn";
import * as tool from "../../../pubilc/util/tool";
import {hideModal, showModal} from "../../../pubilc/util/ToastUtils";
import PropTypes from "prop-types";

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchUserCount,
      fetchWorkers,
      ...globalActions
    }, dispatch)
  }
}

// create a component
class WorkerScene extends PureComponent {

  static propTypes = {
    dispatch: PropTypes.func,
    mine: PropTypes.obj,
    route: PropTypes.obj,
  }

  constructor(props) {
    super(props);
    const {
      currentUser,
      vendor_id,
      vendor_info,
    } = this.props.global;


    const {mine, navigation} = this.props;
    navigation.setOptions({
      headerTitle: '员工管理',
    })

    // let curr_user_info = tool.user_info(mine, currVendorId, currentUser);
    // let limit_store = curr_user_info['store_id'];

    this.state = {
      isRefreshing: false,
      currentUser: currentUser,
      currVendorId: vendor_id,
      currVendorName: vendor_info?.brand_name,
      normal: mine?.normal[vendor_id],
      forbidden: mine?.forbidden[vendor_id],
      limit_store: 0,
    };

    /*if (this.props.route.params === undefined ||
      this.state.normal === undefined ||
      this.state.forbidden === undefined) {
    }*/
    this.onSearchWorkers();

    this.onPress = this.onPress.bind(this);
  }

  UNSAFE_componentWillMount() {
  }

  componentDidMount() {
  }

  onSearchWorkers() {
    const {dispatch} = this.props;
    const {currentUser, accessToken} = this.props.global;
    let vendor_id = this.state.currVendorId;
    let _this = this;
    showModal('加载中')
    InteractionManager.runAfterInteractions(() => {
      dispatch(fetchWorkers(vendor_id, accessToken, (resp) => {
        if (resp.ok) {
          let {normal, forbidden, user_list} = resp.obj;
          let limit_store = 0;
          if (user_list[currentUser]) {
            limit_store = user_list[currentUser]['store_id'];
          }
          _this.setState({
            normal: normal,
            forbidden: forbidden,
            limit_store: parseInt(limit_store),
          });
        }
        hideModal()
        _this.setState({isRefreshing: false});
      }));
    });
  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});

    this.onSearchWorkers();
  }

  onPress(route, params = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  renderUser(user) {
    return (
      <Cell customStyle={[styles.cell_row]} key={user.id}>
        <CellHeader>
          <Image
            style={[styles.worker_img]}
            source={user.image !== '' ? {uri: user.image} : require('../../../img/My/touxiang50x50_.png')}
          />
        </CellHeader>
        <CellBody>
          <Text style={[styles.worker_name]}>{user.name}({user.id}) </Text>
          <CallBtn style={[styles.worker_tel]} mobile={user.mobilephone}/>
        </CellBody>
        <CellFooter>
          <TouchableOpacity
            onPress={() => {
              this.onPress(Config.ROUTE_USER, {
                type: 'worker',
                currentUser: user.id,
                worker_id: user.worker_id,
                navigation_key: this.props.route.key,
                store_id: parseInt(user.store_id),
                currVendorId: this.state.currVendorId,

                mobile: user.mobilephone,
                cover_image: user.image,
                user_name: user.nickname,
                user_status: parseInt(user.status),
              })
            }}
          >
            <Button name='chevron-right' style={styles.right_btn}/>
          </TouchableOpacity>
        </CellFooter>
      </Cell>
    );
  }

  renderList() {
    let {normal, forbidden, limit_store} = this.state;
    let _this = this;

    let normal_worker = [];
    let forbidden_worker = [];
    for (let user_info of Array.from(normal)) {
      if (limit_store === 0 || (user_info.store_id > 0 && parseInt(user_info.store_id) === limit_store)) {
        normal_worker.push(user_info)
      }
    }
    for (let user_info of Array.from(forbidden)) {
      if (limit_store === 0 || (user_info.store_id > 0 && parseInt(user_info.store_id) === limit_store)) {
        forbidden_worker.push(user_info)
      }
    }
    let normal_workers = normal_worker.map((user) => {
      return _this.renderUser(user);
    });
    let forbidden_workers = forbidden_worker.map((user) => {
      return _this.renderUser(user);
    });

    return (
      <View>
        {tool.length(normal_worker) > 0 && (
          <View>
            <CellsTitle style={styles.cell_title}>员工列表</CellsTitle>
            <Cells style={[styles.cells]}>
              {normal_workers}
            </Cells>
          </View>
        )}

        {tool.length(forbidden_worker) > 0 && (
          <View>
            <CellsTitle style={styles.cell_title}>禁用员工列表</CellsTitle>
            <Cells style={[styles.cells]}>
              {forbidden_workers}
            </Cells>
          </View>
        )}
      </View>
    );
  }

  componentDidUpdate() {
    let {key, params} = this.props.route;
    let {shouldRefresh} = (params || {});
    if (shouldRefresh === true) {
      this.onSearchWorkers();
      const setParamsAction = NavigationActions.setParams({
        params: {shouldRefresh: false},
        key: key,
      });
      this.props.navigation.dispatch(setParamsAction);
    }
  }

  render() {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => this.onHeaderRefresh()}
            tintColor='gray'
          />
        }
        style={{backgroundColor: colors.main_back}}
      >
        <View>
          <CellsTitle style={styles.cell_title}>新增员工</CellsTitle>
          <Cells style={[styles.cells]}>
            <Cell
              customStyle={[styles.cell_row]}
              onPress={() => {
                this.onPress(Config.ROUTE_USER_ADD, {
                  type: 'add',
                })
              }}
            >
              <CellHeader>
                <Icon name="person-add" style={[styles.add_user_icon]}/>
              </CellHeader>
              <CellBody>
                <Text style={[styles.worker_name]}>新增员工 </Text>
              </CellBody>
              <CellFooter>
                <Button name='chevron-right' style={styles.right_btn}/>
              </CellFooter>
            </Cell>
          </Cells>
        </View>
        {this.renderList()}
      </ScrollView>
    );
  }
}


// define your styles
const styles = StyleSheet.create({
  cell_title: {
    marginBottom: pxToDp(5),
    fontSize: pxToDp(26),
    color: colors.color999,
  },
  cells: {
    marginTop: 0,
    paddingLeft: 0,
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.color999,
  },
  cell_row: {
    height: pxToDp(90),
    justifyContent: 'center',
    marginLeft: 0,
    paddingLeft: pxToDp(30),
    paddingRight: 0,
  },
  worker_img: {
    width: pxToDp(50),
    height: pxToDp(50),
    marginVertical: pxToDp(20),
    borderRadius: 50,
  },
  worker_name: {
    fontSize: pxToDp(28),
    fontWeight: 'bold',
    color: colors.color333,
  },
  worker_tel: {
    fontSize: pxToDp(22),
    fontWeight: 'bold',
    color: colors.color999,
  },
  add_user_icon: {
    marginRight: pxToDp(10),
    fontSize: pxToDp(50),
    color: '#449af8',
  },
  right_btn: {
    fontSize: pxToDp(30),
    textAlign: 'center',
    width: pxToDp(90),
    height: pxToDp(70),
    color: colors.color999,
    paddingTop: pxToDp(20),
  },
});


//make this component available to the app
// export default WorkerScene;
export default connect(mapStateToProps, mapDispatchToProps)(WorkerScene)
