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

import pxToDp from "../../util/pxToDp";
import Config from "../../config";
import native from "../../common/native";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {connect} from "react-redux";
import {get_help_types} from '../../reducers/help/helpActions'
import {Toast} from "../../weui/index";
import {ToastLong, ToastShort} from "../../util/ToastUtils";
import * as tool from "../../common/tool";

function mapStateToProps(state) {
  const {mine, user, global} = state;
  return {mine: mine, user: user, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      get_help_types,
      ...globalActions
    }, dispatch)
  }
}

class HelpScene extends PureComponent {
  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: '帮助'
    })
  };

  constructor(props) {
    super(props);
    this.state = {
      types: [],
      questions: [],
      query: false,
    }

    this.navigationOptions(this.props)
  }
  UNSAFE_componentWillMount() {
    this.setState({query: true});
    this.getHelpTypeList();
  }

  renderItem(str) {
    return (
        <View style={styles.item_title}>
          <Text style={{fontSize: pxToDp(28), color: '#bfbfbf'}}>{str}</Text>
        </View>
    )
  }
  renderImgage(index) {
    let imgIndex = index % 4;
    switch (index) {
      case 0: {
        return (
            <Image
                source={require('../../img/Help/cheng.png')}
                style={{height: pxToDp(44), width: pxToDp(44)}}
            />
        );
        break;
      }
      case 1: {
        return (
            <Image
                source={require('../../img/Help/lv.png')}
                style={{height: pxToDp(44), width: pxToDp(44)}}
            />
        );
        break;
      }
      case 2: {
        return (
            <Image
                source={require('../../img/Help/lan.png')}
                style={{height: pxToDp(44), width: pxToDp(44)}}
            />
        );
        break;
      }
      case 3: {
        return (
            <Image
                source={require('../../img/Help/tuhuang.png')}
                style={{height: pxToDp(44), width: pxToDp(44)}}
            />
        );
        break;
      }
      default: {
        return (
            <Image
                source={require('../../img/Help/tuhuang.png')}
                style={{height: pxToDp(44), width: pxToDp(44)}}
            />
        );
      }

    }

  }
  toDetail(question_id = 0, type_id = 0) {
    let path = '';
    if (type_id) {
      path = `/help/answer?type_id=${type_id}`
    } else if (question_id) {
      path = `/help/answer?question_id=${question_id}`
    }
    if (path) {
      let url = Config.serverUrl(path, Config.https);
      this.props.navigation.navigate(Config.ROUTE_WEB, {url: url, title: '帮助详情'});
    } else {
      ToastLong('网络错误,请退出重试');
    }
  }
  getHelpTypeList() {
    const {dispatch, global} = this.props;
    dispatch(get_help_types(global.accessToken, async (resp) => {
      if (resp.ok) {
        let {questions, types} = resp.obj
        this.setState({questions, types})
      } else {

      }
      this.setState({query: false});
    }))
  }
  render() {
    let server_info = tool.server_info(this.props);
    return (
        <View style={{flex: 1}}>
          <ScrollView style={{marginBottom: pxToDp(140)}}>
            {
              this.renderItem('常见问题')
            }
            <View>
              <Cells style={{margin: 0, paddingLeft: 0, marginTop: pxToDp(0), borderColor: '#bfbfbf'}}>
                {
                  this.state.questions.map((item, index) => {
                    return (
                        <Cell customStyle={styles.Cell} key={index} access
                              onPress={() => {
                                this.toDetail(item.id, 0)
                              }}
                        >
                          <CellHeader style={styles.cellHeader}>
                            {
                              this.renderImgage(index)
                            }
                          </CellHeader>
                          <CellBody>
                            <Text style={{fontSize: pxToDp(30), color: '#404040'}}>
                              {item.question}
                            </Text>
                          </CellBody>
                          <CellFooter/>
                        </Cell>
                    )
                  })
                }
              </Cells>
            </View>
            <View>
              {
                this.renderItem('更多问题分类')
              }
            </View>
            <View style={{backgroundColor: '#fff', flexDirection: 'row', flexWrap: 'wrap'}}>
              {
                this.state.types.map((item, index) => {
                  return (
                      <TouchableOpacity
                          key={index}
                          onPress={() => {
                            this.toDetail(0, item.id);
                          }}
                          style={index % 2 === 0 ? styles.more_question_left : styles.more_question_right}
                      >
                        <View>
                          <Text style={styles.first_title}>
                            {item.type_name}
                          </Text>
                          <Text style={styles.second_title}>
                            {item.type_detail}
                          </Text>
                        </View>
                      </TouchableOpacity>
                  )
                })
              }
            </View>
            <Toast
                icon="loading"
                show={this.state.query}
                onRequestClose={() => {
                }}
            >加载中</Toast>

          </ScrollView>
          <View style={styles.call_btn_wrapper}>
            <TouchableOpacity
                onPress={() => {
                  native.dialNumber(server_info.mobilephone);
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
    borderColor: "#dcdcdc"

  },
  cellHeader: {
    height: pxToDp(42),
    width: pxToDp(60),
    alignItems: 'center',
    flexDirection: 'row'
  },
  more_question_left: {
    height: pxToDp(150),
    paddingHorizontal: pxToDp(50),
    justifyContent: 'center',
    borderBottomWidth: pxToDp(1),
    borderBottomColor: '#DFDFDF',
    width: '50%',
    borderRightWidth: pxToDp(1),
    borderRightColor: '#DFDFDF',
  },
  more_question_right: {
    height: pxToDp(150),
    paddingHorizontal: pxToDp(50),
    justifyContent: 'center',
    borderBottomWidth: pxToDp(1),
    borderBottomColor: '#DFDFDF',
    width: '50%',
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
