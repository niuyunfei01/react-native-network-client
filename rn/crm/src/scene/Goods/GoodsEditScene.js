import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
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
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import ModalSelector from "../../widget/ModalSelector/index";
import Config from "../../config";
import {uploadImg} from "../../reducers/product/productActions";
import ImagePicker from "react-native-image-crop-picker";
import {fetchUserInfo} from "../../reducers/user/userActions";

function mapStateToProps(state) {
  const {product, global} = state;
  return {product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      uploadImg,
      ...globalActions
    }, dispatch)
  }
}

class GoodsEditScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    return {
      headerTitle: type === 'edit' ? '修改商品' : '新增商品',
      headerRight: (
        <View style={
          {
            flexDirection: 'row',
            paddingRight: pxToDp(30)
          }
        }>
          <TouchableOpacity
            onPress={() => {
            }}
          >
            <Text style={{
              fontSize: pxToDp(32),
              color: '#59b26a'
            }}>保存</Text>
          </TouchableOpacity>
        </View>),
    }
  };

  constructor(props) {
    super(props);
    const {sku_unit, name, weight, sku_having_unit, tag_list, tag_info_nur, promote_name, list_img, price} = (this.props.navigation.state.params.product_detail || {});
    this.state = {
      isRefreshing: false,
      sku_units: [{label: '斤', key: 0}, {label: '个', key: 1}],
      head_supplies: [{label: '是', key: 1}, {label: '否', key: 0}],
      sku_unit: sku_unit,
      head_supply: '是',
      name: name,
      weight: weight,
      sku_having_unit: sku_having_unit,
      tag_list: tag_list,
      tag_info_nur: tag_info_nur,
      promote_name: promote_name,
      Classify: [
        {label: '哈哈', value: '123'},
        {label: '哈哈', value: '234'},
        {label: '哈哈', value: '345'},
        {label: '哈哈', value: '456'},
      ],
      list_img: list_img,
      price: price
    };
  }
  componentDidUpdate() {
    let {key, params} = this.props.navigation.state;
    let {store_categories} = (params || {});
    console.log('store_categories-------->', store_categories)
  }
  pickSingle() {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: false,
      cropperCircleOverlay: false,
      compressImageMaxWidth: 640,
      compressImageMaxHeight: 480,
      compressImageQuality: 0.5,
      compressVideoPreset: 'MediumQuality',
      includeExif: true,
    }).then(image => {
      let image_path = image.path;
      let image_arr = image_path.split('/');
      let image_name = image_arr[image_arr.length-1];
      // let post_img_data = {
      //   file_post_name: 'photo',
      //   file_model_name: 'Product',
      //   no_db: 0,
      //   return_type: 'json',
      //   data_id: 0,
      //   photo: {uri: image_path, type: 'application/octet-stream', name: image_name},
      // };
      // console.log(post_img_data);
      // console.log('received image -> ', image_path);
      let image_info = {
        uri: image_path,
        name: image_name,
      };
      this.uploadImg(image_info);
      this.setState({
        image: {uri: image_path, width: image.width, height: image.height, mime: image_name},
        images: null
      });
    }).catch(e => {
      console.log(e);
    });
  }

  uploadImg(image_info) {
    const {dispatch} = this.props;
    dispatch(uploadImg('Product', image_info, (ok, desc, obj) => {
      console.log('uploadImg => ', ok, desc, obj);
    }));
  }
  render() {
    return (
      <ScrollView>
        <GoodAttrs name="基本信息"/>
        <View>
          <Cells style={styles.my_cells}>
            <Cell customStyle={[styles.my_cell]}>
              <CellHeader style={styles.attr_name}>
                <Label style={[styles.cell_label]}>商品名称</Label>
              </CellHeader>
              <CellBody>
                <TextInput
                  placeholder='输入商品名(不超过14个字)'
                  underlineColorAndroid='transparent'
                  style={[styles.input_text]}
                  value={this.state.name}
                  onChangeText={(text) => {
                    this.setState({name: text})
                  }}
                />
              </CellBody>
            </Cell>
            <ModalSelector
              skin='customer'
              data={this.state.sku_units}
              onChange={(option) => {
                this.setState({sku_unit: option.label})
              }}>
              <Cell customStyle={[styles.my_cell]} access>
                <CellHeader style={styles.attr_name}>
                  <Label style={[styles.cell_label]}>SKU单位</Label>
                </CellHeader>
                <CellBody>
                  <Text>{this.state.sku_unit}</Text>
                </CellBody>
                <CellFooter/>
              </Cell>
            </ModalSelector>
            <Cell customStyle={[styles.my_cell]}>
              <CellHeader style={styles.attr_name}>
                <Label style={[styles.cell_label]}>重量</Label>
              </CellHeader>
              <CellBody>
                <TextInput
                  placeholder='请输入商品重量'
                  underlineColorAndroid='transparent'
                  style={[styles.input_text]}
                  value={this.state.weight}
                  onChangeText={(text) => {
                    this.setState({weight: text})
                  }}
                />
              </CellBody>
              <CellFooter>克</CellFooter>
            </Cell>
            <Cell customStyle={[styles.my_cell]}>
              <CellHeader style={styles.attr_name}>
                <Label style={[styles.cell_label]}>份含量</Label>
              </CellHeader>
              <CellBody>
                <TextInput
                  placeholder='请输入商品份含量'
                  underlineColorAndroid='transparent'
                  style={[styles.input_text]}
                  value={this.state.sku_having_unit}
                  onChangeText={(text) => {
                    this.setState({sku_having_unit: text})
                  }}
                />
              </CellBody>
              <CellFooter/>
            </Cell>
            <Cell customStyle={[styles.my_cell]} access>
              <CellHeader style={styles.attr_name}>
                <Label style={[styles.cell_label]}>基础分类</Label>
              </CellHeader>
              <CellBody>
                <Text>{this.state.tag_list}</Text>
              </CellBody>
              <CellFooter/>
            </Cell>
            <Cell
              customStyle={[styles.my_cell]}
              access
              onPress={() => {
                let {state, navigate} = this.props.navigation;
                navigate(Config.ROUTE_GOODS_CLASSIFY, {
                  Classify: this.state.Classify,
                  nav_key: state.key
                });
              }}
            >
              <CellHeader style={styles.attr_name}>
                <Label style={[styles.cell_label]}>门店分类</Label>
              </CellHeader>
              <CellBody>
                <Text>
                  {this.state.tag_list}
                </Text>
              </CellBody>
              <CellFooter/>
            </Cell>
            <View style={[styles.area_cell, {height: pxToDp(154)}]}>
              <View>
                <Text style={[styles.area_input_title]}>广告词</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: "center"}}>
                <TextInput
                  placeholder='输入广告词'
                  underlineColorAndroid='transparent'
                  maxLength={20}
                  style={[styles.input_text, {fontSize: pxToDp(30), flex: 1}]}
                  value={this.state.promote_name}
                  onChangeText={(text) => {
                    this.setState({promote_name: text})
                  }}
                />
                <Text>{this.state.promote_name.length}/20</Text>
              </View>
            </View>
            <View style={[styles.area_cell, {height: pxToDp(250)}]}>
              <View>
                <Text style={[styles.area_input_title]}>商品介绍</Text>
              </View>
              <View style={{height: pxToDp(134), width: '100%', flexDirection: 'row'}}>
                <TextInput
                  multiline={true}
                  underlineColorAndroid='transparent'
                  placeholder='请输入商品介绍'
                  style={[styles.input_text, {flex: 1, textAlignVertical: 'top'}]}
                  value={this.state.tag_info_nur}
                  onChangeText={(text) => {
                    this.setState({tag_info_nur: text})
                  }}
                />
                <Text style={{alignSelf: 'flex-end'}}>{this.state.tag_info_nur.length}/50</Text>
              </View>
            </View>
          </Cells>
        </View>
        <GoodAttrs name="上传图片"/>
        <View style={[styles.area_cell, {height: pxToDp(215), flexDirection: 'row'}]}>
          {
            this.state.list_img.map((img_url, index) => {
              return (
                <Image
                  key={index}
                  style={styles.img_add}
                  source={{uri: img_url}}
                />
              )
            })
          }
          <TouchableOpacity
            style={[styles.img_add, styles.img_add_box]}
            onPress={() => this.pickSingle()}
          >
            <Text style={{fontSize: pxToDp(36), color: '#bfbfbf'}}>+</Text>
          </TouchableOpacity>
        </View>
        <GoodAttrs name="门店信息"/>
        <Cells style={styles.my_cells}>
          <Cell customStyle={[styles.my_cell]} access>
            <CellHeader style={styles.attr_name}>
              <Label style={[styles.cell_label]}>门店状态</Label>
            </CellHeader>
            <CellBody>
              <Text></Text>
            </CellBody>
            <CellFooter/>
          </Cell>
          <Cell customStyle={[styles.my_cell]}>
            <CellHeader style={styles.attr_name}>
              <Label style={[styles.cell_label]}>商品价格</Label>
            </CellHeader>
            <CellBody>
              <TextInput
                placeholder='请输入商品价格'
                underlineColorAndroid='transparent'
                style={[styles.input_text]}
                value={this.state.price}
              />
            </CellBody>
            <CellFooter>元</CellFooter>
          </Cell>
          <ModalSelector
            skin='customer'
            data={this.state.head_supplies}
            onChange={(option) => {
              this.setState({head_supply: option.label})
            }}>
            <Cell customStyle={[styles.my_cell]} access>
              <CellHeader style={styles.attr_name}>
                <Label style={[styles.cell_label]}>总部供货</Label>
              </CellHeader>
              <CellBody>
                <Text>{this.state.head_supply}</Text>
              </CellBody>
              <CellFooter/>
            </Cell>
          </ModalSelector>
          <Cell customStyle={[styles.my_cell]}>
            <CellHeader style={styles.attr_name}>
              <Label style={[styles.cell_label]}>库存</Label>
            </CellHeader>
            <CellBody>
              <Text style={[styles.cell_label, {width: '100%'}]}>初始为0,请到各个门店单独设置</Text>
            </CellBody>
          </Cell>
        </Cells>
        <View style={{paddingHorizontal: pxToDp(30)}}>
          <Text style={{color: '#B2B2B2', fontSize: pxToDp(30), marginTop: pxToDp(32)}}>发布到以下门店:</Text>
          <Text style={{color: '#B2B2B2', fontSize: pxToDp(30), marginTop: pxToDp(25), marginBottom: pxToDp(32)}}>回龙观店,望京店,三元桥店,西直门店</Text>
        </View>
      </ScrollView>
    )
  }
}
class GoodAttrs extends PureComponent {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <View style={[styles.GoodAttrs]}>
        <Text style={{fontSize: pxToDp(30)}}>{this.props.name}</Text>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  GoodAttrs: {
    height: pxToDp(90),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: pxToDp(30)
  },
  attr_name: {
    width: pxToDp(120),
    marginRight: pxToDp(42),

  },
  cellBorderBottom: {
    borderBottomWidth: pxToDp(1),
    borderStyle: 'solid',
    borderColor: '#EAEAEA'
  },
  my_cells: {
    marginTop: 0,
    marginLeft: 0
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
    backgroundColor: "#fff"
  },
  area_input_title: {
    color: "#363636",
    fontSize: pxToDp(30)
  },
  img_add: {
    height: pxToDp(145),
    width: pxToDp(145),
    marginRight: pxToDp(30)

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
    paddingLeft: 0
  }


})

export default connect(mapStateToProps, mapDispatchToProps)(GoodsEditScene)
