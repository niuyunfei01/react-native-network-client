import React, {PureComponent} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import {Button, Cell, CellBody, CellFooter, CellHeader, Cells, Dialog, Input, Label,} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {getGoodsProduct} from "../../reducers/product/productActions";
import pxToDp from "../../util/pxToDp";
import {markTaskDone} from '../../reducers/remind/remindActions'
import colors from "../../pubilc/styles/colors";
import {NavigationItem} from '../../widget';
import native from "../../common/native";
import {hideModal, showModal, ToastLong} from "../../pubilc/util/ToastUtils";
import Cts from '../../pubilc/common/Cts'
import Config from "../../pubilc/common/config";
import Swiper from "react-native-swiper";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";

function mapStateToProps(state) {
  const {mine, product, global} = state;
  return {mine: mine, product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      getGoodsProduct,
      markTaskDone,
      ...globalActions
    }, dispatch)
  }
}

class GoodsWorkNewProductScene extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isUploadImg: false,
      provided: 1,
      name: '',
      list_img: {},
      upload_files: {},
      goBackValue: false,
      uploading: false,
      showDialog: false,
      price_desc: '',
      slogan: '',
      images: [],
      reason: '',
      visual: false //大图
    };
    this.renderBtn = this.renderBtn.bind(this);
    this.setBeforeRefresh = this.setBeforeRefresh.bind(this);
  }

  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    return {
      headerLeft: () => (<NavigationItem
        icon={require('../../img/Register/back_.png')}
        iconStyle={{width: pxToDp(48), height: pxToDp(48), marginLeft: pxToDp(31), marginTop: pxToDp(20)}}
        onPress={() => {
          if (type == 'add') {
            navigation.navigate(Config.ROUTE_GOODS_APPLY_NEW_PRODUCT)
          } else {
            navigation.goBack();
          }
        }}
      />)
    };
  };

  UNSAFE_componentWillMount() {
    this.getRemark();
    this.setState({task_id: this.props.route.params.task_id});
  }


  componentDidUpdate() {
    let {key, params} = this.props.route;
    let {store_categories, tag_list} = (params || {});
    if (store_categories && tag_list) {
      this.setState({store_categories: store_categories, tag_list: tag_list});
    }
  }

  back(type) {
    if (type == 'add') {
      native.gotoPage(type);
    } else {
      this.props.navigation.goBack();
    }
  }

  getRemark() {
    let {task_id} = this.props.route.params;
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    this.state = {'task_id': task_id};
    if (task_id) {
      showModal('加载中')
      this.setState({uploading: true});
      dispatch(getGoodsProduct(task_id, accessToken, (resp) => {
        this.setState({uploading: false});
        hideModal()
        if (resp.ok) {
          let {remark, price_desc, slogan, images} = resp.obj;
          this.setState({
            name: remark,
            price_desc: price_desc,
            slogan: slogan,
            images: images,
          })
        } else {
          ToastLong(resp.desc + '请返回重试')
        }
      }));
    }
  }

  setBeforeRefresh() {
    this.props.route.params.refresh_list();
    this.props.navigation.goBack();
  }

  async changeTaskStatus(status, reason = '') {
    let {task_id} = this.props.route.params;
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    dispatch(markTaskDone(accessToken, task_id, status, async (ok, reason) => {
      this.setState({upReason: false});
      hideModal()
      if (ok) {
        await this.setState({reason: ''})
        this.setBeforeRefresh();
        this.props.navigation.goBack();
      }
    }, reason));
  }

  renderBtn() {
    let taskId = this.state.task_id;
    return (
      <View style={{paddingVertical: pxToDp(20)}}>
        <Button
          style={[styles.save_btn]}
          onPress={() => {
            this.props.navigation.navigate(Config.ROUTE_GOODS_EDIT, {
              type: 'add',
              task_id: this.props.route.params.task_id,
              name: this.state.name,
              images: this.state.images,
            })
          }}
        >
          <Text style={{color: colors.white}}>立即上新 </Text>
        </Button>
        <Button
          style={[styles.save_btn, styles.save_btn_no]}
          onPress={() => {
            this.setState({showDialog: true})
          }}
        >
          <Text style={{color: colors.main_color}}>暂不上新 </Text>
        </Button>
        {!!taskId && <View style={{marginTop: pxToDp(50), alignItems: 'center'}}>
          <TouchableOpacity
            onPress={async () => {
              if (this.state.upReason) {
                return false
              }
              await this.setState({upReason: true});
              showModal('提交中..')
              this.changeTaskStatus(Cts.TASK_STATUS_DONE, '')
            }}
          >
            <Text style={{color: colors.editStatusDeduct, fontSize: pxToDp(24)}}>标记已上新 </Text>
          </TouchableOpacity>
        </View>}
      </View>
    )
  }

  renderImg(images = []) {
    if (images.length > 0) {
      return (
        <View style={[styles.area_cell, styles.add_img_wrapper]}>
          {
            images.map((item, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    this.index = index;
                    this.setState({
                      visual: true
                    });
                  }}
                >
                  <View
                    key={index}
                    style={{
                      height: pxToDp(170),
                      width: pxToDp(170),
                      flexDirection: "row",
                      alignItems: "flex-end"
                    }}
                  >
                    <Image style={styles.img_add} source={{uri: item}}/>
                  </View>
                </TouchableOpacity>
              )
            })
          }
        </View>
      )
    } else {
      return null;
    }
  }

  modal = () => {
    // let index = this.state.images.findIndex(i => i.timestamp === this.timestamp)
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          this.setState({visual: false});
        }}
      >
        <View
          style={[
            styles.center,
            {
              position: "absolute",
              top: 0,
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height - 50,
              zIndex: 99999,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: colors.opacity3
            }
          ]}
        >
          <View
            style={{
              height: Dimensions.get('window').width,
              width: Dimensions.get('window').width
            }}
          >
            <Swiper
              showsButtons={false}
              autoplay={false}
              showsPagination={true}
              activeDotColor={colors.theme}
              dotColor={colors.white}
              index={this.index}
              loop={false}
            >
              {this.state.images.map(item => {
                return (
                  <TouchableWithoutFeedback
                    onPress={() => {
                      this.setState({
                        visual: false
                      });
                    }}
                  >
                    <Image
                      style={{
                        width: Dimensions.get('window').width,
                        height: Dimensions.get('window').width
                      }}
                      source={{uri: item}}
                    />
                  </TouchableWithoutFeedback>
                );
              })}
            </Swiper>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  render() {
    let {name, price_desc, slogan, images} = this.state;
    return (
      <ScrollView style={{flex: 1}}>
        {this.state.visual ? this.modal() : null}
        <View>
          <Cells style={styles.my_cells}>
            <Cell customStyle={[styles.my_cell]}>
              <CellHeader style={styles.attr_name}>
                <Label style={[styles.cell_label]}>商品名称</Label>
              </CellHeader>
              <CellBody>
                <Text style={[styles.input_text]}>
                  {name}
                </Text>
              </CellBody>
            </Cell>

            <Cell customStyle={[styles.my_cell]}>
              <CellHeader style={styles.attr_name}>
                <Label style={[styles.cell_label]}>价格描述</Label>
              </CellHeader>
              <CellBody>
                <Text style={[styles.input_text]}>
                  {price_desc}
                </Text>
              </CellBody>
              <CellFooter/>
            </Cell>
            <View style={[styles.area_cell, {height: pxToDp(250)}]}>
              <View>
                <Text style={[styles.area_input_title]}>商品介绍</Text>
              </View>
              <View style={{height: pxToDp(134), width: '100%', flexDirection: 'row'}}>
                <TextInput
                  multiline={true}
                  underlineColorAndroid='transparent'
                  editable={false}
                  placeholderTextColor={"#7A7A7A"}
                  style={[styles.input_text, {flex: 1, textAlignVertical: 'top'}]}
                  value={slogan}
                  onChangeText={(text) => {
                    this.setState({content: text})
                  }}
                />

              </View>
            </View>
          </Cells>
        </View>

        {
          this.renderImg(images)
        }

        {
          this.renderBtn('NewProduct')
        }

        <Dialog onRequestClose={() => {
        }}
                visible={this.state.showDialog}
                title={'备注(理由)'}
                buttons={[{
                  type: 'default',
                  label: '取消',
                  onPress: () => {
                    this.setState({showDialog: false})
                  }
                }, {
                  type: 'primary',
                  label: '确定',
                  onPress: async () => {
                    if (this.state.upReason) {
                      return false
                    }
                    await this.setState({showDialog: false, upReason: true});
                    showModal('提交中..')
                    this.changeTaskStatus(Cts.TASK_STATUS_CONFIRMED, this.state.reason)
                  }
                }]}
        >
          <Input
            multiline={true}
            style={{height: pxToDp(90)}}
            value={this.state.reason}
            onChangeText={(text) => {
              this.setState({reason: text})
            }}
          />
        </Dialog>
      </ScrollView>
    )
  }
}


const styles = StyleSheet.create({
  cellBorderBottom: {
    borderBottomWidth: pxToDp(1),
    borderStyle: 'solid',
    borderColor: '#EAEAEA'
  },
  my_cells: {
    marginTop: 0,
    marginLeft: 0,
    borderWidth: 0,
    borderBottomWidth: 0,
    borderTopWidth: 0
  },

  my_cell: {
    marginLeft: 0,
    borderColor: colors.new_back,
    paddingHorizontal: pxToDp(30),
    flexDirection: 'row',
    alignItems: 'center',
    margin: 0

  },
  cell_label: {
    width: pxToDp(130),
    color: "#363636"
  },
  cell_body: {
    flex: 1
  },
  area_cell: {
    paddingHorizontal: pxToDp(30),
    borderTopColor: colors.new_back,
    borderStyle: 'solid',
    borderTopWidth: pxToDp(1),
    paddingVertical: pxToDp(35),
    backgroundColor: "#fff",
  },
  area_input_title: {
    color: "#363636",
    fontSize: pxToDp(30)
  },
  img_add: {
    height: pxToDp(145),
    width: pxToDp(145),
    justifyContent: 'space-around',
    borderWidth: pxToDp(1),
    borderColor: '#bfbfbf',
  },
  img_add_box: {
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'solid',
    borderWidth: pxToDp(1),
    borderColor: '#bfbfbf'
  },
  input_text: {
    marginLeft: 0,
    paddingLeft: 0,
    color: colors.color777
  },
  add_img_wrapper: {
    minHeight: pxToDp(215),
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: pxToDp(20),
    paddingTop: pxToDp(10),
  },
  save_btn: {
    backgroundColor: colors.main_color,
    marginTop: pxToDp(50),
    marginHorizontal: pxToDp(30),
  },
  save_btn_no: {
    backgroundColor: colors.back_color,
    borderWidth: pxToDp(1),
    borderColor: colors.main_color
  },
  center: {
    justifyContent: "center",
    alignItems: "center"
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(GoodsWorkNewProductScene)
