import React, {PureComponent} from 'react'
import {Image, InteractionManager, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import {Flex} from "../../../weui";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import {fetchUserCount, fetchWorkers} from "../../../reducers/mine/mineActions";
import JbbText from "../../common/component/JbbText";
import HttpUtils from "../../../pubilc/util/http";
import DeviceInfo from "react-native-device-info";


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

class GuideScene extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: true,
      title: "",
      list: [],
    }
  }

  componentDidMount() {
    this.setState({isRefreshing: true});
    this.get_guide(() => {
      this.setState({isRefreshing: false});
    });
  }

  componentWillUnmount() {

  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.get_guide(() => {
      this.setState({isRefreshing: false})
    })
  }

  get_guide(callback = () => {
  }) {
    const {accessToken} = this.props.global;
    let brand = DeviceInfo.getBrand();
    const api = `api/get_guide/${brand}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then(res => {
      this.setState({
        title: res.title,
        list: res.body,
      }, callback)
    })
  }

  renderMagList = () => {
    const list = this.state.list
    let returnArray = []
    for (let msg of list) {
      returnArray.push(
          <View>
            <Text style={{
              fontSize: pxToDp(30),
              marginTop: pxToDp(30),
              color: 'black',
            }}>{msg.title}
              <Text style={{
                fontSize: pxToDp(20),
                color: colors.color666,
              }}>{msg.dev} </Text>
            </Text>
            <Text style={{
              fontSize: pxToDp(30),
              marginTop: pxToDp(10),
              paddingLeft: pxToDp(25),
              color: colors.color666,
            }}>{msg.content} </Text>
            <Flex style={{padding: '1%'}}>
              {msg.img_arr.map((img, index) => (
                      <Image source={{uri: img}} style={styles.image}/>
                  )
              )}
            </Flex>

          </View>
      )
    }
    return returnArray
  }

  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
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
            } style={{backgroundColor: colors.main_back, margin: pxToDp(30)}}>
          <JbbText style={{
            fontSize: pxToDp(40),
            color: 'black',
          }}>{this.state.title} </JbbText>

          {this.renderMagList()}

        </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  cell_title: {
    marginBottom: pxToDp(5),
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
    paddingRight: pxToDp(10),
  },
  cell_body_text: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color333,
  },
  cell_body_comment: {
    fontSize: pxToDp(24),
    fontWeight: 'bold',
    color: colors.color999,
  },
  body_status: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.main_color,
  },
  status_err: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    backgroundColor: colors.main_color,
    borderRadius: pxToDp(15),
    padding: pxToDp(3),
    color: colors.f7,
  },
  printer_status_error: {
    color: '#f44040',
  },
  right_box: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: pxToDp(60),
    paddingTop: pxToDp(10),
  },
  right_btn: {
    fontSize: pxToDp(25),
    paddingTop: pxToDp(8),
    marginLeft: pxToDp(10),
  },
  image: {
    width: pxToDp(300),
    margin: pxToDp(10),
    height: pxToDp(500),
  },
});


export default connect(mapStateToProps, mapDispatchToProps)(GuideScene)
