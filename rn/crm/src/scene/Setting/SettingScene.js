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
  Switch
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
class SettingScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;

    return {
      headerTitle: (
        <View>
          <Text style={{color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'}}>设置</Text>
        </View>
      ),
      headerStyle: {backgroundColor: colors.back_color, height: pxToDp(78)},
      headerRight: '',
    }
  };

  constructor(props: Object) {
    super(props);

    this.state = {
      isRefreshing: false,
      switch_val: false,
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.setState({isRefreshing: false});
  }

  onPress(route, params = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
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
        <CellsTitle style={[styles.cell_title]}>蓝牙打印机</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell style={[styles.cell_row]}  customStyle={[styles.customStyle, {paddingRight: 0,
          }]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>自动打印</Text>
            </CellBody>
            <CellFooter>
              <Switch
                value={this.state.switch_val}
                onValueChange={(val) => {
                  this.setState({switch_val: val});
                }}
              />
            </CellFooter>
          </Cell>
          <Cell style={[styles.cell_row]}  customStyle={styles.customStyle}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>惠普打印机</Text>
            </CellBody>
            <CellFooter>
              <TouchableOpacity
                onPress={() => {
                }}
              >
                <Button name='chevron-right' style={styles.right_btn}/>
              </TouchableOpacity>
            </CellFooter>
          </Cell>
        </Cells>

        <CellsTitle style={styles.cell_title}>云打印机</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell style={[styles.cell_row]}  customStyle={styles.customStyle}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>添加云打印机</Text>
            </CellBody>
            <CellFooter>
              <TouchableOpacity
                onPress={() => {
                }}
              >
                <Button name='chevron-right' style={styles.right_btn}/>
              </TouchableOpacity>
            </CellFooter>
          </Cell>
        </Cells>

        <CellsTitle style={styles.cell_title}>提醒</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell style={[styles.cell_row]}  customStyle={styles.customStyle}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>语音播报</Text>
            </CellBody>
            <CellFooter>
              <Switch
                value={this.state.switch_val}
                onValueChange={(val) => {
                  this.setState({switch_val: val});
                }}
              />
            </CellFooter>
          </Cell>
          <Cell style={[styles.cell_row]}  customStyle={styles.customStyle}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>导航栏提醒</Text>
            </CellBody>
            <CellFooter>
              <Switch
                value={this.state.switch_val}
                onValueChange={(val) => {
                  this.setState({switch_val: val});
                }}
              />
            </CellFooter>
          </Cell>
          <Cell style={[styles.cell_row]}  customStyle={styles.customStyle}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>新消息震动</Text>
            </CellBody>
            <CellFooter>
              <Switch
                value={this.state.switch_val}
                onValueChange={(val) => {
                  this.setState({switch_val: val});
                }}
              />
            </CellFooter>
          </Cell>
        </Cells>


        <CellsTitle style={styles.cell_title}>通知筛选</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell style={[styles.cell_row]}  customStyle={styles.customStyle}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>新订单</Text>
            </CellBody>
            <CellFooter>
              <Switch
                value={this.state.switch_val}
                onValueChange={(val) => {
                  this.setState({switch_val: val});
                }}
              />
            </CellFooter>
          </Cell>
          <Cell style={[styles.cell_row]}  customStyle={styles.customStyle}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>配送订单</Text>
            </CellBody>
            <CellFooter>
              <Switch
                value={this.state.switch_val}
                onValueChange={(val) => {
                  this.setState({switch_val: val});
                }}
              />
            </CellFooter>
          </Cell>
          <Cell style={[styles.cell_row]}  customStyle={styles.customStyle}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>订单异常</Text>
            </CellBody>
            <CellFooter>
              <Switch
                value={this.state.switch_val}
                onValueChange={(val) => {
                  this.setState({switch_val: val});
                }}
              />
            </CellFooter>
          </Cell>
        </Cells>


      </ScrollView>
    );
  }

}


// define your styles
const styles = StyleSheet.create({
  cell_title: {
    marginBottom: pxToDp(5),
  },
  cell_box: {
    marginTop: 0,
    paddingLeft: pxToDp(20),
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.color999,
  },
  cell_row: {
    height: pxToDp(70),
    justifyContent: 'center',
    borderColor: colors.color999,
    borderBottomWidth: pxToDp(1),
  },
  customStyle: {
    marginLeft: 0,
  },
  cell_body_text: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color333,
  },


  border: {
    borderWidth: pxToDp(1),
    borderColor: '#000',
  },
});


//make this component available to the app
// export default WorkerScene;
export default connect(mapStateToProps, mapDispatchToProps)(SettingScene)
