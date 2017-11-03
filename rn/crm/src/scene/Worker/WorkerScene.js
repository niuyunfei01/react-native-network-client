//import liraries
import React, {PureComponent} from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  InteractionManager
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {
  Cells,
  CellsTitle,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
} from "../../weui/index";
import Icon from 'react-native-vector-icons/MaterialIcons';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchUserCount, fetchWorkers} from "../../reducers/mine/mineActions";
import {ToastShort} from "../../util/ToastUtils";
import Config from "../../config";
import Button from 'react-native-vector-icons/Entypo';
import {NavigationActions} from 'react-navigation';
import LoadingView from "../../widget/LoadingView";
import CallBtn from "../Order/CallBtn";

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
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;

    return {
      headerTitle: (
        <View>
          <Text style={{color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'}}>员工管理</Text>
        </View>
      ),
      headerRight: '',
    }
  };

  constructor(props: Object) {
    super(props);
    const {
      currentUser,
      currStoreId,
      canReadStores,
    } = this.props.global;

    console.log('currStoreId -> ', currStoreId);
    let currVendorId = canReadStores[currStoreId]['vendor_id'];
    let currVendorName = canReadStores[currStoreId]['vendor'];

    const {mine} = this.props;

    this.state = {
      isRefreshing: false,
      currentUser: currentUser,
      currVendorId: currVendorId,
      currVendorName: currVendorName,
      normal: mine.normal[currVendorId],
      forbidden: mine.forbidden[currVendorId],
    };

    if (this.props.navigation.state.params === undefined ||
      this.state.normal === undefined ||
      this.state.forbidden === undefined) {
      this.onSearchWorkers();
    }

    this.onPress = this.onPress.bind(this);
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  onSearchWorkers() {
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    let vendor_id = this.state.currVendorId;
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      dispatch(fetchWorkers(vendor_id, accessToken, (resp) => {
        if (resp.ok) {
          let {normal, forbidden} = resp.obj;
          _this.setState({
            normal: normal,
            forbidden: forbidden,
            isRefreshing: false,
          });
        }
      }));
    });
  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});

    this.onSearchWorkers();
  }

  onPress(route, params = {}) {
    console.log('onPress -> ', route, params);
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
            source={user.image !== '' ? {uri: user.image} : require('../../img/My/touxiang50x50_.png')}
          />
        </CellHeader>
        <CellBody>
          <Text style={[styles.worker_name]}>{user.nickname}({user.id})</Text>
          {/*<Text style={[styles.worker_tel]}>{user.mobilephone}</Text>*/}
          <CallBtn style={[styles.worker_tel]} mobile={user.mobilephone}/>
        </CellBody>
        <CellFooter>
          <TouchableOpacity
            onPress={() => {
              this.onPress(Config.ROUTE_USER, {
                type: 'worker',
                currentUser: user.id,
                worker_id: user.worker_id,
                navigation_key: this.props.navigation.state.key,
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
    let {normal, forbidden} = this.state;
    if (normal === undefined || forbidden === undefined) {
      return <LoadingView/>;
    }
    let _this = this;
    let normal_workers = Array.from(normal).map((user) => {
      return _this.renderUser(user);
    });
    let forbidden_workers = Array.from(forbidden).map((user) => {
      return _this.renderUser(user);
    });

    return (
      <View>
        <CellsTitle style={styles.cell_title}>员工列表</CellsTitle>
        <Cells style={[styles.cells]}>
          {normal_workers}
        </Cells>
        <CellsTitle style={styles.cell_title}>禁用员工列表</CellsTitle>
        <Cells style={[styles.cells]}>
          {forbidden_workers}
        </Cells>
      </View>
    );
  }

  componentDidUpdate() {
    let {key, params} = this.props.navigation.state;
    let {shouldRefresh} = (params || {});
    if (shouldRefresh === true) {
      console.log(' Refresh worker list -> ', this.props.navigation.state);
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
                <Text style={[styles.worker_name]}>新增员工</Text>
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
