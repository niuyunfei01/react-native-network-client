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
  Input,
  Label,
  Icon,
  Toast,
} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {ToastLong, ToastShort} from "../../util/ToastUtils";
import Config from "../../config";
import Entypo from 'react-native-vector-icons/Entypo';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Cts from "../../Cts";
import ModalSelector from "react-native-modal-selector";
import selector from "../../styles/selector";
import DateTimePicker from 'react-native-modal-datetime-picker';
import {saveOfflineStore} from "../../reducers/mine/mineActions";
import * as tool from "../../common/tool";

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      saveOfflineStore,
      ...globalActions
    }, dispatch)
  }
}

// create a component
class StoreAddScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;

    let title = params.btn_type === 'add' ? '新增门店' : '门店信息/修改';

    return {
      headerTitle: (
        <View>
          <Text style={{color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'}}>{title}</Text>
        </View>
      ),
      headerStyle: {backgroundColor: colors.back_color, height: pxToDp(78)},
      headerRight: (params.btn_type === 'add' ? null : (
        <TouchableOpacity
          style={{marginRight: pxToDp(20), width: pxToDp(60), height: pxToDp(50)}}
          onPress={() => {
            ToastShort('onPress');
          }}
        >
          <Entypo name='dots-three-horizontal' style={styles.btn_select}/>
        </TouchableOpacity>
      )),
    }
  };

  constructor(props: Object) {
    super(props);

    let {currVendorId, currVendorName} = tool.vendor(this.props.global);
    console.log('currVendorId -> ', currVendorId);
    const {
      btn_type,
      store_info,
    } = (this.props.navigation.state.params || {});

    let {
      id = 0, //store_id
      shop_no,
      area_id,
      alias = '',
      name = '',
      type = currVendorId,
      district = '',
      owner_name = '',
      owner_nation_id = '',
      location_long = '',
      location_lat = '',
      deleted = 0,
      can_remark_address,
      child_area_id,
      tel = '',
      mobile = '',
      dada_address = '',
      owner_id = '',
      open_end = '19:00:00',
      open_start = '09:00:00',
      vice_mgr = 0,
      call_not_print = '0',
      ship_way = Cts.SHIP_AUTO,
      printer_cfg,
      auto_add_tips,
      bd_shop_id,
    } = (store_info || {});

    const {mine} = this.props;
    let user_list = mine.user_list[currVendorId];

    let userActionSheet = [];
    userActionSheet.push({key: -999, section: true, label: '职位任命'},);
    userActionSheet.push({key: 0, label: '不任命任何人'},);
    for (let user_info of mine.normal[currVendorId]) {
      let item = {
        key: user_info.id,
        label: user_info.nickname,
      };
      userActionSheet.push(item);
    }

    this.state = {
      isRefreshing: false,
      btn_type: btn_type,
      onSubmitting: false,
      user_list: user_list,
      userActionSheet: userActionSheet,

      isStartVisible: false,
      isEndVisible: false,

      store_id: id > 0 ? id : 0,
      type: type,//currVendorId
      alias: alias,//别名
      name: name,//店名
      district: district,//所属区域
      owner_name: owner_name,//店长姓名
      owner_nation_id: owner_nation_id,//身份证号
      location_long: location_long,
      location_lat: location_lat,
      deleted: deleted,
      tel: tel,//门店电话
      mobile: mobile,//店长电话
      dada_address: dada_address,//门店地址
      owner_id: owner_id,//店长ID
      open_end: open_end,
      open_start: open_start,
      vice_mgr: vice_mgr,//店副ID
      call_not_print: call_not_print,//未打印通知
      ship_way: ship_way,//配送方式
    };
    this.onPress = this.onPress.bind(this);
    this.onCheckUser = this.onCheckUser.bind(this);
    this.onStoreAdd = this.onStoreAdd.bind(this);
    this.onCheckData = this.onCheckData.bind(this);
  }

  onPress(route, params = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  onCheckUser(user_type, user_id) {
    let {user_list} = this.state;
    if (user_type === 'owner') {
      this.setState({
        owner_id: user_id,
        owner_name: user_id > 0 ? user_list[user_id]['nickname'] : '',
        mobile: user_id > 0 ? user_list[user_id]['mobilephone'] : '',
      });
    } else {
      this.setState({
        vice_mgr: user_id,
      });
    }
  }

  _hideDateTimePicker = () => this.setState({
    isStartVisible: false,
    isEndVisible: false,
  });

  _handleDatePicked = (date, press_type) => {
    console.log('params -> ', date, press_type);
    let Hours = date.getHours();
    let Minutes = date.getMinutes();
    Hours = Hours < 10 ? '0' + Hours : Hours;
    Minutes = Minutes < 10 ? '0' + Minutes : Minutes;
    console.log('Hours -> ', Hours);
    console.log('Minutes -> ', Minutes);
    let confirm_time = `${Hours}:${Minutes}:00`;
    if (press_type === 'start') {
      let end_hour = this.state.open_end.split(':')[0];
      if (Hours > end_hour) {
        ToastLong('开始营业时间不能大于结束营业时间');
      } else {
        this.setState({open_start: confirm_time});
      }
    } else {
      let start_hour = this.state.open_start.split(':')[0];
      if (start_hour > Hours) {
        ToastLong('结束营业时间不能小于开始营业时间');
      } else {
        this.setState({open_end: confirm_time});
      }
    }

    this._hideDateTimePicker();
  };

  render() {
    let {store_id, alias, name, district, owner_name, owner_nation_id, location_long, location_lat, deleted, tel, mobile, dada_address, owner_id, open_end, open_start, vice_mgr, call_not_print, ship_way, printer_cfg, auto_add_tips, user_list} = this.state;
    let vice_mgr_name = vice_mgr > 0 ? user_list[vice_mgr]['nickname'] : undefined;

    return (
      <ScrollView style={{backgroundColor: colors.main_back}}>
        <CellsTitle style={styles.cell_title}>门店信息</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellHeader>
              <Label style={[styles.cell_label]}>店铺名称</Label>
            </CellHeader>
            <CellBody>
              <Input
                onChangeText={(name) => this.setState({name})}
                value={name}
                style={[styles.cell_input]}
                placeholder="8个字符以内"
                underlineColorAndroid='transparent' //取消安卓下划线
              />
            </CellBody>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellHeader>
              <Label style={[styles.cell_label]}>门店电话</Label>
            </CellHeader>
            <CellBody>
              <Input
                onChangeText={(tel) => this.setState({tel})}
                value={tel}
                style={[styles.cell_input]}
                placeholder="请输入店铺电话"
                maxLength={18} // 可输入的最大长度
                keyboardType='numeric' //默认弹出的键盘
                underlineColorAndroid='transparent' //取消安卓下划线
              />
            </CellBody>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellHeader>
              <Label style={[styles.cell_label]}>门店地址</Label>
            </CellHeader>
            <CellBody>
              <Input
                onChangeText={(dada_address) => this.setState({dada_address})}
                value={dada_address}
                style={[styles.cell_input]}
                placeholder="请输入门店地址"
                underlineColorAndroid='transparent' //取消安卓下划线
              />
            </CellBody>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellHeader>
              <Label style={[styles.cell_label]}>所属区域</Label>
            </CellHeader>
            <CellBody>
              <Input
                onChangeText={(district) => this.setState({district})}
                value={district}
                style={[styles.cell_input]}
                placeholder="例: 昌平区"
                underlineColorAndroid='transparent' //取消安卓下划线
              />
            </CellBody>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellHeader>
              <Label style={[styles.cell_label]}>定位信息</Label>
            </CellHeader>
            <CellBody>
              <TouchableOpacity
                style={{flexDirection: 'row', marginTop: pxToDp(6)}}
                onPress={() => {
                  let center = '';
                  if (location_long && location_lat) {
                    center = `${location_long},${location_lat}`;
                  }
                  const params = {
                    action: Config.LOC_PICKER,
                    center: center,
                    actionBeforeBack: (resp) => {
                      let {name, location, address} = resp;
                      console.log('location -> ', resp);
                      let locate = location.split(',');
                      this.setState({
                        location_long: locate[0],
                        location_lat: locate[1],
                      });
                    }
                  };
                  this.onPress(Config.ROUTE_WEB, params);
                }}
              >
                <MIcon name='map-marker-outline' style={styles.map_icon}/>
                <Text style={[styles.body_text]}>
                  {location_long !== '' && location_lat !== '' ? location_long + ',' + location_lat : '点击选择地址'}
                </Text>
              </TouchableOpacity>
            </CellBody>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellHeader>
              <Label style={[styles.cell_label]}>身份证号</Label>
            </CellHeader>
            <CellBody>
              <Input
                onChangeText={(owner_nation_id) => this.setState({owner_nation_id})}
                value={owner_nation_id}
                maxLength={18} // 可输入的最大长度
                style={[styles.cell_input]}
                placeholder="请输入本人身份证号"
                keyboardType='numeric' //默认弹出的键盘
                underlineColorAndroid='transparent' //取消安卓下划线
              />
            </CellBody>
          </Cell>
        </Cells>


        <CellsTitle style={styles.cell_title}>店长信息</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellHeader>
              <Label style={[styles.cell_label]}>店长</Label>
            </CellHeader>
            <CellBody>
              <ModalSelector
                onChange={(option) => {
                  this.onCheckUser('owner', option.key)
                }}
                data={this.state.userActionSheet}
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
                cancelTextStyle={selector.cancelTextStyle}
              >
                <Text style={styles.body_text}>{owner_id > 0 ? owner_name : '点击选择店长'}</Text>
              </ModalSelector>
            </CellBody>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellHeader>
              <Label style={[styles.cell_label]}>店长手机号</Label>
            </CellHeader>
            <CellBody>
              <Input
                onChangeText={(mobile) => this.setState({mobile})}
                value={mobile}
                maxLength={11} // 可输入的最大长度
                style={[styles.cell_input]}
                placeholder="店长手机号"
                keyboardType='numeric' //默认弹出的键盘
                underlineColorAndroid='transparent' //取消安卓下划线
              />
            </CellBody>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellHeader>
              <Label style={[styles.cell_label]}>店助</Label>
            </CellHeader>
            <CellBody>
              <ModalSelector
                onChange={(option) => {
                  this.onCheckUser('vice_mgr', option.key)
                }}
                data={this.state.userActionSheet}
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
                cancelTextStyle={selector.cancelTextStyle}
              >
                <Text style={styles.body_text}>{vice_mgr > 0 ? vice_mgr_name : '点击选择店助'}</Text>
              </ModalSelector>
            </CellBody>
          </Cell>
        </Cells>

        <CellsTitle style={styles.cell_title}>营业时间</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellHeader>
              <Label style={[styles.cell_label]}>开始营业</Label>
            </CellHeader>
            <CellBody>
              <TouchableOpacity onPress={() => {
                this.setState({isStartVisible: true})
              }}>
                <Text style={styles.body_text}>{open_start}</Text>
              </TouchableOpacity>
              <DateTimePicker
                date={new Date(`1970-01-01 ${open_start}`)}
                mode='time'
                isVisible={this.state.isStartVisible}
                onConfirm={(date) => {
                  this._handleDatePicked(date, 'start')
                }}
                onCancel={this._hideDateTimePicker}
              />
            </CellBody>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellHeader>
              <Label style={[styles.cell_label]}>结束营业</Label>
            </CellHeader>
            <CellBody>
              <TouchableOpacity onPress={() => {
                this.setState({isEndVisible: true})
              }}>
                <Text style={styles.body_text}>{open_end}</Text>
              </TouchableOpacity>
              <DateTimePicker
                date={new Date(`1970-01-01 ${open_end}`)}
                mode='time'
                isVisible={this.state.isEndVisible}
                onConfirm={(date) => {
                  this._handleDatePicked(date, 'end')
                }}
                onCancel={this._hideDateTimePicker}
              />
            </CellBody>
          </Cell>
        </Cells>

        <CellsTitle style={styles.cell_title}>电话催单间隔(0为不催单)</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellHeader>
              <Label style={[styles.cell_label]}>首次催单间隔</Label>
            </CellHeader>
            <CellBody style={{flexDirection: 'row', alignItems: 'center'}}>
              <Input
                onChangeText={(call_not_print) => this.setState({call_not_print})}
                value={call_not_print}
                style={[styles.cell_input, {width: pxToDp(65)}]}
                keyboardType='numeric' //默认弹出的键盘
                underlineColorAndroid='transparent' //取消安卓下划线
              />
              <Text style={[styles.body_text]}>分钟</Text>
            </CellBody>
          </Cell>
        </Cells>

        <CellsTitle style={styles.cell_title}>排单方式</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell
            onPress={() => {
              this.setState({ship_way: Cts.SHIP_AUTO})
            }}
            customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={styles.cell_label}>不排单</Text>
            </CellBody>
            <CellFooter>
              {Cts.SHIP_AUTO === parseInt(ship_way) ? <Icon name="success_no_circle" style={{fontSize: 16,}}/> : null}
            </CellFooter>
          </Cell>
          <Cell
            onPress={() => {
              this.setState({ship_way: Cts.SHIP_AUTO_FN_DD})
            }}
            customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={styles.cell_label}>自动发单</Text>
            </CellBody>
            <CellFooter>
              {Cts.SHIP_AUTO_FN_DD === parseInt(ship_way) ?
                <Icon name="success_no_circle" style={{fontSize: 16,}}/> : null}
            </CellFooter>
          </Cell>
        </Cells>

        <Button
          onPress={() => {
            this.onStoreAdd();
          }}
          type='primary'
          style={styles.btn_submit}
        >
          {this.state.btn_type === 'edit' ? '确认修改' : '创建门店'}
        </Button>
        <Toast
          icon="loading"
          show={this.state.onSubmitting}
          onRequestClose={() => {
          }}
        >提交中</Toast>

      </ScrollView>
    );
  }

  onStoreAdd() {
    if (this.state.onSubmitting) {
      return false;
    }
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    let _this = this;
    if (this.onCheckData()) {
      let {currVendorId, btn_type, store_id, type, alias, name, district, owner_name, owner_nation_id, location_long, location_lat, deleted, tel, mobile, dada_address, owner_id, open_end, open_start, vice_mgr, call_not_print, ship_way, printer_cfg, auto_add_tips} = this.state;

      let send_data = {
        type: type,//品牌id
        name: name,
        //alias: name,
        owner_name: owner_name,
        owner_nation_id: owner_nation_id,
        owner_id: owner_id,
        mobile: mobile,
        tel: tel,
        dada_address: dada_address,
        location_long: location_long,
        location_lat: location_lat,
        open_start: open_start,
        open_end: open_end,
        district: district,
        call_not_print: call_not_print,
        ship_way: ship_way,
        vice_mgr: vice_mgr,
      };
      if (store_id > 0) {
        send_data.id = store_id;
      }
      console.log('send_data -> ', send_data);
      _this.setState({onSubmitting: false});

      InteractionManager.runAfterInteractions(() => {
        dispatch(saveOfflineStore(send_data, accessToken, (resp) => {
          console.log('save_resp -> ', resp);
          _this.setState({onSubmitting: false});
          if (resp.ok) {
            let msg = btn_type === 'add' ? '添加门店成功' : '操作成功';
            ToastShort(msg);

            const {goBack, state} = _this.props.navigation;
            const params = state.params;
            if (params.actionBeforeBack) {
              params.actionBeforeBack({shouldRefresh: true})
            }
            goBack();
          }
        }));
      });
    }
  }

  onCheckData() {
    let {store_id, alias, name, district, owner_name, owner_nation_id, location_long, location_lat, deleted, tel, mobile, dada_address, owner_id, open_end, open_start, vice_mgr, call_not_print, ship_way, printer_cfg, auto_add_tips} = this.state;
    let error_msg = '';
    if (name.length < 1 || name.length > 8) {
      error_msg = '店名应在1-8个字符内';
    } else if (tel.length < 8 || tel.length > 11) {
      error_msg = '门店电话格式有误';
    } else if (dada_address.length < 1) {
      error_msg = '请输入门店地址';
    } else if (district.length < 1) {
      error_msg = '请输入门店所在区域';
    } else if (location_long === '' || location_lat === '') {
      error_msg = '请选择门店定位信息';
    } else if (owner_nation_id.length !== 18 && owner_nation_id.length !== 11) {
      error_msg = '身份证格式有误';
    } else if (!(owner_id > 0)) {
      error_msg = '请选择门店店长';
    } else if (mobile.length !== 11) {
      error_msg = '店长手机号格式有误';
    }
    if (error_msg === '') {
      this.setState({onSubmitting: true});
      return true;
    } else {
      ToastLong(error_msg);
      return false;
    }
  }

}


// define your styles
const styles = StyleSheet.create({
  btn_select: {
    fontSize: pxToDp(40),
    color: colors.color666,
    textAlign: 'center',
  },
  cell_title: {
    marginBottom: pxToDp(10),
    fontSize: pxToDp(26),
    color: colors.color999,
  },
  cell_box: {
    marginTop: 0,
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.color999,
  },
  cell_row: {
    height: pxToDp(70),
    justifyContent: 'center',
  },
  cell_input: {
    //需要覆盖完整这4个元素
    fontSize: pxToDp(30),
    height: pxToDp(90),
  },
  cell_label: {
    width: pxToDp(234),
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color333,
  },
  btn_submit: {
    margin: pxToDp(30),
    marginBottom: pxToDp(50),
    backgroundColor: '#6db06f',
  },
  map_icon: {
    fontSize: pxToDp(40),
    color: colors.color666,
    height: pxToDp(60),
    width: pxToDp(40),
    textAlignVertical: 'center',
  },
  body_text: {
    paddingLeft: pxToDp(8),
    fontSize: pxToDp(30),
    color: colors.color333,
    height: pxToDp(60),
    textAlignVertical: 'center',

    // borderColor: 'green',
    // borderWidth: 1,
  },
});


//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(StoreAddScene)
