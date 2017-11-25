import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TouchableHighlight,
  ScrollView,
  RefreshControl,
  InteractionManager,
  TextInput
} from 'react-native';
import {
  Cells,
  CellsTitle,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Input,
  Label,
  Icon,
  Toast,
  TextArea
} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";


function mapStateToProps(state) {
  const {product, global} = state;
  return {product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
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
    const { product_detail} = this.props.navigation.state.params
    this.state = {
      isRefreshing: false,
      product_detail:product_detail,
    };

    console.log(product_detail)

  }


  render() {
    return (
      <ScrollView>
        <GoodAttrs name="基本信息"/>
        <Cells>
          <Cell customStyle={[styles.myCell]}>
            <CellHeader style={styles.attr_name}>
              <Label style={[styles.cell_label]}>商品名称</Label>
            </CellHeader>
            <CellBody>
              <TextInput
                placeholder='输入商品名(不超过14个字)'
                underlineColorAndroid='transparent'
                style={[styles.input_text]}
                value={this.state.product_detail.name}
              />
            </CellBody>
          </Cell>

          <Cell customStyle={[styles.myCell]} access>
            <CellHeader style={styles.attr_name}>
              <Label style={[styles.cell_label]}>SKU单位</Label>
            </CellHeader>
            <CellBody>
              <Text>{this.state.product_detail.sku_unit}</Text>
            </CellBody>
            <CellFooter/>
          </Cell>

          <Cell customStyle={[styles.myCell]}>
            <CellHeader style={styles.attr_name}>
              <Label style={[styles.cell_label]}>重量</Label>
            </CellHeader>
            <CellBody>
              <TextInput
                placeholder='请输入商品重量'
                underlineColorAndroid='transparent'
                style={[styles.input_text]}
                value={this.state.product_detail.weight}
              />
            </CellBody>
            <CellFooter>
              克
            </CellFooter>
          </Cell>
          <Cell customStyle={[styles.myCell]}>
            <CellHeader style={styles.attr_name}>
              <Label style={[styles.cell_label]}>份含量</Label>
            </CellHeader>
            <CellBody>
              <TextInput
                placeholder='请输入商品份含量'
                underlineColorAndroid='transparent'
                style={[styles.input_text]}
                value = {this.state.product_detail.sku_having_unit}
              />
            </CellBody>
            <CellFooter/>
          </Cell>

          <Cell customStyle={[styles.myCell]} access>
            <CellHeader style={styles.attr_name}>
              <Label style={[styles.cell_label]}>基础分类</Label>
            </CellHeader>
            <CellBody>
              <TextInput
                placeholder='选择基础分类'
                underlineColorAndroid='transparent'
                style={[styles.input_text]}
                value={this.state.product_detail.tag_list}
              />
            </CellBody>
            <CellFooter/>
          </Cell>
          <Cell customStyle={[styles.myCell]} access>
            <CellHeader style={styles.attr_name}>
              <Label style={[styles.cell_label]}>门店分类</Label>
            </CellHeader>
            <CellBody>
              <TextInput
                placeholder='选择门店分类'
                underlineColorAndroid='transparent'
                style={[styles.input_text]}
              />
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
                style={[styles.input_text, {fontSize: pxToDp(30), flex: 1}]}
                value={this.state.product_detail.promote_name}
              />
              <Text>0/20</Text>
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
              />
              <Text style={{alignSelf: 'flex-end'}}>0/50</Text>
            </View>
          </View>

        </Cells>
        <GoodAttrs name="上传图片"/>

        <View style={[styles.area_cell, {height: pxToDp(215), flexDirection: 'row'}]}>

          {
            this.state.product_detail.list_img.map((img_url,index) => {
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
        <GoodAttrs name="门店信息"/>
        <Cells>
          <Cell customStyle={[styles.myCell]} access>
            <CellHeader style={styles.attr_name}>
              <Label style={[styles.cell_label]}>门店状态</Label>
            </CellHeader>
            <CellBody>
              <TextInput
                placeholder='选择门店状态'
                underlineColorAndroid='transparent'
                style={[styles.input_text]}
              />
            </CellBody>
            <CellFooter/>
          </Cell>

          <Cell customStyle={[styles.myCell]}>
            <CellHeader style={styles.attr_name}>
              <Label style={[styles.cell_label]}>商品价格</Label>
            </CellHeader>
            <CellBody>
              <TextInput
                placeholder='请输入商品价格'
                underlineColorAndroid='transparent'
                style={[styles.input_text]}
                value={this.state.product_detail.price}
              />
            </CellBody>
            <CellFooter>
              元
            </CellFooter>
          </Cell>
          <Cell customStyle={[styles.myCell]} access>
            <CellHeader style={styles.attr_name}>
              <Label style={[styles.cell_label]}>总部供货</Label>
            </CellHeader>
            <CellBody>
              <Text>是</Text>
            </CellBody>
            <CellFooter/>
          </Cell>
          <Cell customStyle={[styles.myCell]}>
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
  constructor(props){
    super(props)
  }

  render() {
    return (
      <View style={[styles.GoodAttrs]}>
        <Text style={{color: '#B2B2B2', fontSize: pxToDp(30), padding: 0}}>{this.props.name}</Text>

      </View>
    )
  }
}


const styles = StyleSheet.create({
  GoodAttrs:{
    height: pxToDp(90),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal:pxToDp(30)
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
  myCell: {
    marginLeft: 0,
    borderColor: colors.new_back,
    paddingHorizontal: pxToDp(30),
    flexDirection: 'row',
    alignItems: 'center',

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
