import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Label,
} from "../../weui/index";

import {NavigationActions} from "react-navigation";
import pxToDp from "../../util/pxToDp";
import Config from "../../config";
import native from "../../common/native";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {connect} from "react-redux";
function mapStateToProps(state) {
  const {mine, user, global} = state;
  return {mine: mine, user: user, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}
class HelpScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    return {
      headerTitle: '帮助'
    }
  };
  constructor(props) {
    super(props);
    this.state = {
      comQuestList: [
        {
          imgUrl: '../../img/Help/cheng.png',
          title: '如何查看微信收到的款项历史？',
          id :1,
          type_id:1
        },
        {
          imgUrl: '../../img/Help/cheng.png',
          title: '如何查看微信收到的款项历史？'
        },
        {
          imgUrl :'../../img/Help/cheng.png',
          title: '如何查看微信收到的款项历史？'
        },
        {
          imgUrl :'../../img/Help/cheng.png',
          title: '如何查看微信收到的款项历史？'
        },
        {
          imgUrl :'../../img/Help/cheng.png',
          title: '如何查看微信收到的款项历史？'
        }
      ]
    }
  }
  
  renderItem(str) {
    return (
        <View style={styles.item_title}>
          <Text style={{fontSize: pxToDp(28), color: '#bfbfbf'}}>{str}</Text>
        </View>
    )
  }

  goDetail(id,typeID = 0){
    // const path = `stores/orders_go_to_buy/${order.order.id}.html?access_token=${global.accessToken}`;
    // this.props.navigation.navigate(Config.ROUTE_WEB, {url: Config.serverUrl('', Config.https)});
    let {global} = this.props;
    console.log(global);
    let url = `http://192.168.1.29/test/query_answer/${id}/${typeID}`;
    this.props.navigation.navigate(Config.ROUTE_WEB, {url: url});
  }
  render() {
    return (
        <View style={{flex: 1}}>
          <ScrollView style={{marginBottom: pxToDp(140)}}>
            {
              this.renderItem('常见问题')
            }
            <View>
              <Cells style={{margin: 0, paddingLeft: 0,marginTop:pxToDp(0),borderColor:'#bfbfbf'}}>
                <TouchableOpacity>
                  {
                    this.state.comQuestList.map((item, index) => {
                      return (
                          <Cell customStyle={styles.Cell} key={index} access>
                            <CellHeader style={styles.cellHeader}>
                              <Image
                                  source={require('../../img/Help/cheng.png')}
                                  style={{height: pxToDp(44), width: pxToDp(44)}}
                              />
                            </CellHeader>
                            <CellBody>
                              <Text style={{fontSize: pxToDp(30), color: '#404040'}}>
                                {item.title}
                              </Text>
                            </CellBody>
                            <CellFooter/>
                          </Cell>
                      )
                    })
                  }
                </TouchableOpacity>
              </Cells>
            </View>
            <View>
              {
                this.renderItem('更多问题分类')
              }
            </View>
            <View style={{backgroundColor: '#fff'}}>
              <TouchableOpacity
                  onPress={()=>{
                    this.goDetail(0,1)
                  }}
              >
                <View style={styles.more_question}>
                  <View style={styles.more_item_left}>
                    <Text style={styles.first_title}>账号/密码等问题</Text>
                    <Text style={styles.second_title}>账号，密码，权限</Text>
                  </View>
                  <View style={[styles.more_item_left, {borderRightWidth: 0, paddingLeft: pxToDp(30)}]}>
                    <Text style={styles.first_title}>账号/密码等问题</Text>
                    <Text style={styles.second_title}>账号，密码，权限</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.more_question}>
                <View style={styles.more_item_left}>
                  <Text style={styles.first_title}>账号/密码等问题</Text>
                  <Text style={styles.second_title}>账号，密码，权限</Text>
                </View>
                <View style={[styles.more_item_left, {borderRightWidth: 0, paddingLeft: pxToDp(30)}]}>
                  <Text style={styles.first_title}>账号/密码等问题</Text>
                  <Text style={styles.second_title}>账号，密码，权限</Text>
                </View>
              </View>
            </View>
          </ScrollView>
          <View style={styles.call_btn_wrapper}>
          <TouchableOpacity
          onPress={() => {
            native.dialNumber('18310084054');
          }}
          >
            <View style={styles.call_btn}>
              <Image
                  source={require('../../img/Help/dianhua.png')}
                  style={{width: pxToDp(36), height: pxToDp(30), marginRight: pxToDp(24)}}
              />
              <Text style={{fontSize: pxToDp(30), color: '#59b26a'}}>找不到问题？电话咨询</Text>
            </View>
            </TouchableOpacity>
          </View>
         
        </View>
    )
  }

}

const styles = StyleSheet.create({
  item_title: {
    height: pxToDp(80),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: pxToDp(30),
  },
  Cell: {
    height: pxToDp(90),
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 0,
    paddingHorizontal: pxToDp(30),
    borderColor:"#dcdcdc"

  },
  cellHeader:{
    height: pxToDp(42),
    width: pxToDp(60),
    alignItems: 'center',
    flexDirection: 'row'
  },
  more_question: {
    height: pxToDp(150),
    paddingHorizontal: pxToDp(50),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: pxToDp(1),
    borderBottomColor: '#bfbfbf'
  },
  more_item_left: {
    height: '100%',
    justifyContent: 'center',
    borderRightWidth: pxToDp(1),
    width: '50%',
    borderRightColor: "#bfbfbf"
  },

  first_title: {
    fontSize: pxToDp(30),
    color: '#404040'
  },
  second_title: {
    fontSize: pxToDp(24),
    color: '#bfbfbf',
    marginTop: pxToDp(15),

  },
  call_btn_wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: pxToDp(120),
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: 'center'
  },
  call_btn: {
    height: pxToDp(90),
    width: pxToDp(660),
    borderWidth: pxToDp(1),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#59b26a',
    borderRadius: 10,

  }
});
export default connect(mapStateToProps, mapDispatchToProps)(HelpScene)
