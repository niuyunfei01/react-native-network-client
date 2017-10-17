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
      headerStyle: {backgroundColor: colors.back_color, height: pxToDp(78)},
      headerRight: '',
    }
  };

  constructor(props: Object) {
    super(props);
    const {
      currentUser,
      currStoreId,
      canReadStores,
      accessToken,
    } = this.props.global;

    const {mine} = this.props;
    this.state = {
      isRefreshing: false,
      accessToken: accessToken,
      currentUser: currentUser,
      currVendorId: canReadStores[currStoreId]['vendor_id'],
      currVendorName: canReadStores[currStoreId]['vendor'],
      normal: mine.normal,
      forbidden: mine.forbidden,
    };

    if(this.state.normal === undefined || this.state.forbidden === undefined){
      this.onSearchWorkers();
    }
  }

  componentWillMount() {
  }

  onSearchWorkers() {
    const {dispatch} = this.props;
    let token = this.state.accessToken;
    let vendor_id = this.state.currVendorId;
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      dispatch(fetchWorkers(vendor_id, token, (resp) => {
        if (resp.ok) {
          let {normal, forbidden} = resp.obj;
          _this.setState({
            normal: normal,
            forbidden: forbidden,
          });
          if (_this.state.isRefreshing) {
            ToastShort('刷新完成');
          }
        }
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
      <Cell style={[styles.worker_box]} key={user.id}>
        <CellHeader>
          <Image
            style={[styles.worker_img]}
            source={user.image !== '' ? {uri: user.image} : require('../../img/My/touxiang50x50_.png')}
          />
        </CellHeader>
        <CellBody style={[styles.worker_info]}>
          <Text style={[styles.worker_name]}>{user.nickname}({user.id})</Text>
          <Text style={[styles.worker_tel]}>{user.mobilephone}</Text>
        </CellBody>
        <CellFooter>
          <TouchableOpacity
            onPress={() => this.onPress(Config.ROUTE_USER, {
              type: 'worker',
              mobile: user.mobilephone,
              cover_image: user.image,
              currentUser: user.id,
              screen_name: user.nickname,
              user_status: user.status,
            })}
          >
            <Button name='chevron-right' style={styles.right_btn}/>
          </TouchableOpacity>
        </CellFooter>
      </Cell>
    );
  }

  renderList() {
    let {normal, forbidden} = this.state;
    if(normal === undefined || forbidden === undefined){
      return null;
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
        <Cells style={[styles.cells, styles.border_top]}>
          {normal_workers}
        </Cells>
        <CellsTitle style={styles.cell_title}>禁用员工列表</CellsTitle>
        <Cells style={[styles.cells, styles.border_top]}>
          {forbidden_workers}
        </Cells>
      </View>
    );
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
        style={{backgroundColor: '#f2f2f2'}}
      >
        <View>
          <CellsTitle style={styles.cell_title}>新增员工</CellsTitle>
          <Cells style={[styles.cells, styles.border_top]}>
            <Cell style={[styles.worker_box, {justifyContent: 'center'}]}>
              <CellHeader>
                <Icon name="person-add" style={[styles.add_user_icon]}/>
              </CellHeader>
              <CellBody style={[styles.worker_info]}>
                <Text style={[styles.worker_name]}>新增员工</Text>
              </CellBody>
              <CellFooter>
                <TouchableOpacity
                  onPress={() => this.onPress(Config.ROUTE_USER_ADD)}
                >
                  <Button name='chevron-right' style={styles.right_btn}/>
                </TouchableOpacity>
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
    paddingLeft: pxToDp(30),
  },
  cells: {
    marginTop: 0,
  },
  border_top: {
    borderTopWidth: pxToDp(1),
    borderTopColor: colors.color999,
  },
  worker_box: {
    borderColor: colors.color999,
    borderBottomWidth: pxToDp(1),
    height: pxToDp(90),
  },
  worker_img: {
    width: pxToDp(50),
    height: pxToDp(50),
    marginVertical: pxToDp(20),
    borderRadius: 50,
  },
  worker_info: {},
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
    width: pxToDp(50),
    height: pxToDp(50),
    color: colors.color999,
    paddingTop: pxToDp(10),
  },
});


//make this component available to the app
// export default WorkerScene;
export default connect(mapStateToProps, mapDispatchToProps)(WorkerScene)
