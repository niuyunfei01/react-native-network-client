import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  InteractionManager
} from 'react-native';
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Label,
} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {getGoodsProduct} from "../../reducers/product/productActions";
import {getVendorStores} from "../../reducers/mine/mineActions";
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import tool from '../../common/tool';
import {NavigationItem} from '../../widget';
import native from "../../common/native";
import {ToastLong} from "../../util/ToastUtils";
import {NavigationActions} from "react-navigation";
import {Toast, Dialog, Icon, Button,Input} from "../../weui/index";
import Cts from '../../Cts'
import Config from "../../config";

function mapStateToProps(state) {
  const {mine, product, global} = state;
  return {mine: mine, product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      getGoodsProduct,
      ...globalActions
    }, dispatch)
  }
}

class GoodsWorkNewProductScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    return {
      headerTitle: '申请工单上新',
      headerLeft: (<NavigationItem
          icon={require('../../img/Register/back_.png')}
          iconStyle={{width: pxToDp(48), height: pxToDp(48), marginLeft: pxToDp(31), marginTop: pxToDp(20)}}
          onPress={() => {
            if (type == 'add') {
              native.gotoPage(type);
            } else {
              navigation.goBack();
            }
          }}
      />)
    };
  };

  constructor(props) {

    super(props);
    this.state = {
      isRefreshing: false,
      isUploadImg: false,
      provided: 1,
      name: '',
      describe: '',
      content: '',
      list_img: {},
      upload_files: {},
      goBackValue: false,
      obj: {
        "id": "5127",
        "remark": "硒砂瓜",
        "slogan": "",
        "images": []
      },
      uploading: false,
      showDialog: false,

    };
    this.renderBtn = this.renderBtn.bind(this)
  }

  componentWillMount() {
    this.getRemark()
  }

  componentDidMount() {
    let {navigation} = this.props;
    navigation.setParams({upLoad: this.upLoad});
  }

  componentDidUpdate() {
    let {key, params} = this.props.navigation.state;
    let {store_categories, tag_list} = (params || {});
    if (store_categories && tag_list) {
      console.log('tag_list -> ', tag_list);
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
    let {task_id} = this.props.navigation.state.params;
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    let _this = this;
    this.setState({uploading: true})
    dispatch(getGoodsProduct(task_id, accessToken, (resp) => {
      this.setState({uploading: false})

      if (resp.ok) {
        this.setState({obj: resp.obj})
      } else {
        ToastLong('resp.desc' + '请返回重试')
      }
    }));
  }

  renderBtn(type) {
    return (
        <View style={{paddingVertical: pxToDp(20)}}>
          <Button
              style={[styles.save_btn]}
              onPress={() => {
                this.props.navigation.navigate(Config.ROUTE_GOODS_EDIT, {
                  type: 'add',
                  remark_id: this.state.obj.id,
                  name:this.state.obj.remark

                })
              }}
          >
            <Text style={{color: colors.white}}>立即上新</Text>
          </Button>
          <Button
              style={[styles.save_btn, styles.save_btn_no]}
              onPress={() => {
                this.setState({showDialog: true})
              }}
          >
            <Text style={{color: colors.main_color}}>暂不上新</Text>
          </Button>

          {/*<Text style=>标记为以上新</Text>*/}
        </View>
    )
  }

  renderImg(images = []) {
    console.log('images>>>>>>>>', images);
    if (images.length > 0) {
      return (
          <View style={[styles.area_cell, styles.add_img_wrapper]}>
            {
              images.map((item, index) => {
                return (
                    <View key={index}
                          style={{
                            height: pxToDp(170),
                            width: pxToDp(170),
                            flexDirection: 'row',
                            alignItems: 'flex-end'
                          }}>
                      <Image
                          style={styles.img_add}
                          source={{uri: item}}
                      />
                    </View>
                )
              })
            }
          </View>
      )
    } else {
      return null;
    }

  }

  render() {
    let {remark, price_desc, slogan, images} = this.state.obj;
    return (
        <ScrollView style={{flex: 1}}>
          <View>
            <Cells style={styles.my_cells}>
              <Cell customStyle={[styles.my_cell]}>
                <CellHeader style={styles.attr_name}>
                  <Label style={[styles.cell_label]}>商品名称</Label>
                </CellHeader>
                <CellBody>
                  <Text style={[styles.input_text]}>
                    {remark}
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
                      placeholder='请输入商品介绍'
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
          <Toast
              icon="loading"
              show={this.state.uploading}
              onRequestClose={() => {
              }}
          >加载中</Toast>
          <Dialog onRequestClose={() => {
          }}
                  visible={this.state.showDialog}
                  title={'备注(理由)'}
                  titleStyle={{flexDirection:'row',justifyContent:'center'}}
                  buttons={[{
                    type: 'default',
                    label: '取消',
                    onPress: () => {
                      this.setState({showDialog: false})
                    }
                  },{
                    type: 'primary',
                    label: '确定',
                    onPress: () => {
                      this.setState({showDialog: false})
                    }
                  }]}
          >
            <Input
                multiline={true}
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
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(GoodsWorkNewProductScene)
