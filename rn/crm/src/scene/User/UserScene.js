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
  Button,
  ButtonArea,
} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchUserCount, fetchWorkers} from "../../reducers/mine/mineActions";
import {ToastShort} from "../../util/ToastUtils";


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
class UserScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;

    return {
      headerTitle: (
        <View>
          <Text style={{color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'}}>个人详情</Text>
        </View>
      ),
      headerStyle: {backgroundColor: colors.back_color, height: pxToDp(78)},
      headerRight: '',
    }
  };

  constructor(props: Object) {
    super(props);

    let {
      type,
      cover_image,
      mobile,
      currentUser,//个人页的当前用户ID必须是传入进来的
      screen_name,
      user_status,
    } = this.props.navigation.state.params || {};

    const {mine} = this.props;

    this.state = {
      isRefreshing: false,
      type: type,
      sign_count: mine.sign_count[currentUser] === undefined ? 0 : mine.sign_count[currentUser],
      bad_cases_of: mine.bad_cases_of[currentUser] === undefined ? 0 : mine.bad_cases_of[currentUser],
      mobile: mobile,
      cover_image: cover_image,
      screen_name: screen_name,
      currentUser: currentUser,
      user_status: user_status,
    };

    if (mine.sign_count[currentUser] === undefined || mine.sign_count[currentUser] === undefined) {
      this.onGetUserCount();
    }
  }

  componentWillMount() {
  }

  onGetUserCount() {
    const {accessToken} = this.props.global;
    const {currentUser} = this.state;
    let _this = this;
    const {dispatch} = this.props;
    InteractionManager.runAfterInteractions(() => {
      dispatch(fetchUserCount(currentUser, accessToken, (resp) => {
        if (resp.ok) {
          let {sign_count, bad_cases_of} = resp.obj;
          console.log('resp -> ', resp.obj);
          _this.setState({
            sign_count: sign_count,
            bad_cases_of: bad_cases_of,
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

    this.onGetUserCount();
  }

  render() {
    let {type, user_status} = this.state;
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => this.onHeaderRefresh()}
            tintColor='gray'
          />
        }
        style={{backgroundColor: colors.white}}
      >
        <View style={styles.user_box}>
          <Image style={[styles.user_img]}
                 source={this.state.cover_image !== '' ? {uri: this.state.cover_image} : require('../../img/My/touxiang180x180_.png')}/>
          <Text style={[styles.user_name]}>{this.state.screen_name}</Text>
        </View>
        <Cells style={[styles.cells]}>
          <Cell style={[styles.tel_box]}>
            <CellBody>
              <Text style={[styles.user_tel]}>电话</Text>
            </CellBody>
            <CellFooter>
              <Text style={[styles.user_mobile]}>{this.state.mobile}</Text>
            </CellFooter>
          </Cell>
        </Cells>
        <View style={[styles.info_box]}>
          <View style={[styles.info_item, {borderRightWidth: pxToDp(1)}]}>
            <Text style={[styles.info_num]}>{this.state.sign_count}</Text>
            <Text style={[styles.info_name]}>当月出勤天数</Text>
          </View>
          <View style={[styles.info_item]}>
            <Text style={[styles.info_num]}>{this.state.bad_cases_of}</Text>
            <Text style={[styles.info_name]}>30天投诉</Text>
          </View>
        </View>
        {type === 'mine' ?
          (<Button type='warn' style={styles.btn_logout}>退出登录</Button>) :
          (user_status === '禁用' ?
              <Button type='primary' style={styles.btn_allow}>取消禁用</Button> :
              <Button type='warn' style={styles.btn_logout}>禁用</Button>
          )
        }
      </ScrollView>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  user_box: {
    height: pxToDp(300),
    flex: 1,
    alignItems: 'center',
  },
  user_img: {
    width: pxToDp(180),
    height: pxToDp(180),
    borderRadius: 50,
    marginTop: pxToDp(30),
    marginBottom: pxToDp(25),
  },
  user_name: {
    fontSize: pxToDp(30),
    lineHeight: pxToDp(32),
    fontWeight: 'bold',
    color: colors.color333,
    textAlign: 'center',
  },

  cells: {
    marginTop: 0,
  },
  tel_box: {
    height: pxToDp(70),
    borderColor: colors.color999,
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    justifyContent: 'center'
  },
  user_tel: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color333,
  },
  user_mobile: {
    fontSize: pxToDp(32),
    color: colors.color999,
  },

  info_box: {
    flexDirection: 'row',
    height: pxToDp(110),
    borderColor: colors.color999,
    // borderTopWidth:pxToDp(1),
    borderBottomWidth: pxToDp(1),
    justifyContent: 'center'
  },
  info_item: {
    marginVertical: pxToDp(10),
    borderColor: colors.color999,
    width: '50%',
  },
  info_num: {
    fontSize: pxToDp(40),
    lineHeight: pxToDp(40),
    fontWeight: 'bold',
    color: colors.color333,
    textAlign: 'center',
    alignItems: 'center',
    marginBottom: pxToDp(15),
  },
  info_name: {
    fontSize: pxToDp(24),
    lineHeight: pxToDp(25),
    fontWeight: 'bold',
    color: colors.color999,
    textAlign: 'center',
    alignItems: 'center',
  },
  btn_logout: {
    marginHorizontal: pxToDp(30),
    marginTop: pxToDp(65),
    backgroundColor: '#dc7b78',
  },
  btn_allow: {
    marginHorizontal: pxToDp(30),
    marginTop: pxToDp(65),
    backgroundColor: '#6db06f',
  },
});


//make this component available to the app
// export default UserScene;
export default connect(mapStateToProps, mapDispatchToProps)(UserScene)
