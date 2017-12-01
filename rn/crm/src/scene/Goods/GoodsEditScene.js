import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ToastAndroid,
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
import {productSave} from "../../reducers/product/productActions";
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import ModalSelector from "../../widget/ModalSelector/index";
import Config from "../../config";
import tool from '../../common/tool';



function mapStateToProps(state) {
  const {product, global} = state;
  return {product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      productSave,
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
            onPress={()=>{
              navigation.state.params.upload()
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
    let {store_tags} = this.props.product;
    let {currVendorId} = tool.vendor(this.props.global);
    const basic_categories =   this.props.product.basic_category[currVendorId]
    const basic_cat_list = this.toModalData(basic_categories)
    store_tags = store_tags[currVendorId]

    this.state = {
      isRefreshing: false,
      basic_cat_list:basic_cat_list ,
      sku_units: [{label: '斤', key: 0}, {label: '个', key: 1}],
      head_supplies: [{label: '是', key: 1}, {label: '否', key: 0}],
      basic_categories:basic_categories,
      head_supply: '',
      name: '',
      sku_having_unit: '',
      tag_info_nur: '',
      promote_name: '',
      upload_files: [],
      price: '',
      basic_category:1,
      vendor_id:currVendorId,
      store_categories:[],
      store_tags:store_tags,
      tag_list:'选择门店分类',
      id:'',
      sku_unit: '',
      weight: '',
    };

  }
  componentWillMount(){
    let  {params} =  this.props.navigation.state;
    let {type} = params
    if(type == 'edit'){
      const {basic_category,id , sku_unit, tag_list_id, name, weight, sku_having_unit, tag_list, tag_info_nur, promote_name, list_img, price} = (this.props.navigation.state.params.product_detail || {});
      this.setState({
        head_supply: '是',
        name: name,
        sku_having_unit: sku_having_unit,
        tag_info_nur: tag_info_nur,
        promote_name: promote_name,
        upload_files: list_img,
        price: price,
        basic_category:basic_category,
        store_categories:tag_list_id,
        tag_list:tag_list,
        id:id,
        sku_unit: sku_unit,
        weight: weight,}
        )
    }
  }
  componentDidMount(){
    let  {params} =  this.props.navigation.state;
    params.upload = this.upload
    params.store_categories = this.state.store_categories;
    params.tag_list = this.state.tag_list;
    this.props.navigation.setParams(params);
  }
  componentDidUpdate() {
    let {key, params} = this.props.navigation.state;
    let {store_categories , tag_list} = (params || {});
    this.setState({store_categories:store_categories,tag_list:tag_list})
  }
  toModalData(obj){
    let arr = [];
    Object.keys(obj).map((key) => {
      let json = {}
      json.label = obj[key];
      json.key = key
      arr.push(json)
    })
    return arr
  }

  upload = () =>{
    let {id ,name , vendor_id,sku_unit,weight,sku_having_unit,basic_category,store_categories,promote_name,tag_info_nur,upload_files} = this.state
    let msg ={
      id,
      vendor_id,
      name ,
      sku_unit,
      weight,
      sku_having_unit,
      basic_category,
      store_categories,
      promote_name,
      content:tag_info_nur,
      upload_files:{
        // 1111:{id:1111,name:'asaasasa.jpg'},
        // 2222:{id:2222,name:'ssssssss.jpg'},
        // 3333:{id:3333,name:'33333333.jpg'}
      }
    }
    const { dispatch ,global } = this.props;
    let token = global.accessToken;

    this.dataValidate(msg)
    // dispatch(productSave(msg,token,(ok,reason,obj)=>{
    //   console.log(ok,reason,obj)
    // }))
  }
  dataValidate(msg){
    let type = this.props.navigation.state.params.type;
    let {id ,name , vendor_id,sku_unit,weight,sku_having_unit,basic_category,store_categories,promote_name,content,upload_files} = msg
    if (id <= 0) {
      ToastAndroid.show('不能为空', ToastAndroid.LONG)
      return false;
    } else if (name.length <= 0 && name == 'undefined') {
      ToastAndroid.show('请输入商品名', ToastAndroid.LONG)
      return false;
    } else if ((sku_unit == '斤') || (sku_unit == '克')) {
      ToastAndroid.show('选择SKU单位', ToastAndroid.LONG)
      return false;
    } else if (weight <= 0) {
      ToastAndroid.show('平均重量不能为0', ToastAndroid.LONG)
      return false;
    } else if (sku_having_unit <= 0) {
      ToastAndroid.show('净含量不能为0', ToastAndroid.LONG)
      return false;
    } else if (basic_category < 0){
      ToastAndroid.show('请选择基础分类', ToastAndroid.LONG)
      return false;
    }else if (store_categories.length < 0){
      ToastAndroid.show('请选择门店分类', ToastAndroid.LONG)
      return false;
    }else if (promote_name.length <= 0){
      ToastAndroid.show('请输入广告词', ToastAndroid.LONG)
      return false;
    }else if (content.length <= 0){
      ToastAndroid.show('请输入商品介绍', ToastAndroid.LONG)
      return false;
    }else if (Object.keys(upload_files).length <= 0){
      ToastAndroid.show('请重新上传图片', ToastAndroid.LONG)
      return false;
    }
    if(type == 'edit'){

    }else if(type == 'add'){

    }

  }


  renderAddGood(){
    let {type} = this.props.navigation.state.params
    if(!(type === 'edit')){
      return <View>
        <GoodAttrs name="门店信息"/>
        <Cells style={styles.my_cells}>
          <Cell customStyle={[styles.my_cell]} access>
            <CellHeader style={styles.attr_name}>
              <Label style={[styles.cell_label]}>售卖状态</Label>
            </CellHeader>
            <CellBody>
              <Text/>
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
              <Text style={[styles.cell_label, {width: '100%'}]}>初始为0,请各门店单独设置</Text>
            </CellBody>
          </Cell>
        </Cells>
        <View style={{paddingHorizontal: pxToDp(30)}}>
          <Text style={{color: '#B2B2B2', fontSize: pxToDp(30), marginTop: pxToDp(32)}}>发布到以下门店:</Text>
          <Text style={{color: '#B2B2B2', fontSize: pxToDp(30), marginTop: pxToDp(25), marginBottom: pxToDp(32)}}>回龙观店,望京店,三元桥店,西直门店</Text>
        </View>
      </View>
    }
  }

  render (){
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
                <Label style={[styles.cell_label]}>平均重量</Label>
              </CellHeader>
              <CellBody>
                <TextInput
                  placeholder='请输入商品重量'
                  underlineColorAndroid='transparent'
                  style={[styles.input_text]}
                  value={this.state.weight}
                  keyboardType='numeric'
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
                  keyboardType='numeric'
                  value={this.state.sku_having_unit}
                  onChangeText={(text) => {
                    this.setState({sku_having_unit: text})
                  }}
                />
              </CellBody>
              <CellFooter/>
            </Cell>
            <ModalSelector
              skin='customer's
              data={this.state.basic_cat_list}
              onChange={(option) => {
                this.setState({basic_category:option.key})
              }}>
              <Cell customStyle={[styles.my_cell]} access>
                <CellHeader style={styles.attr_name}>
                  <Label style={[styles.cell_label]}>基础分类</Label>
                </CellHeader>
                <CellBody>
                  <Text>{  !this.state.basic_categories[this.state.basic_category] ? '选择基础分类' : this.state.basic_categories[this.state.basic_category]    }</Text>
                </CellBody>
                <CellFooter/>
              </Cell>
            </ModalSelector>
            <Cell
              customStyle={[styles.my_cell]}
              access
              onPress={() => {
                let {state, navigate} = this.props.navigation;
                navigate(Config.ROUTE_GOODS_CLASSIFY, {
                  nav_key: state.key,
                  store_categories: this.state.store_categories,
                  vendor_id : this.state.vendor_id
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
            this.state.upload_files.map((img_url, index) => {
              return (
                <Image
                  key={index}
                  style={styles.img_add}
                  source={{uri: img_url}}
                />
              )
            })
          }
          <View style={[styles.img_add, styles.img_add_box]}>
            <Text style={{fontSize: pxToDp(36), color: '#bfbfbf'}}>+</Text>
          </View>
        </View>
        {
          this.renderAddGood()
        }

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
