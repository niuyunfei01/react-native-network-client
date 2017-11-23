import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TouchableHighlight, ScrollView, RefreshControl, InteractionManager,TextInput } from 'react-native';
import { Cells, CellsTitle, Cell, CellHeader, CellBody, CellFooter, Input, Label, Icon, Toast, } from "../../weui/index";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";


function mapStateToProps(state) {
  const { product, global } = state;
  return { product: product, global: global }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class GoodsEditScene extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    let { type } = params;
    return {
      headerTitle: type == 'edit' ? '修改商品' : '新增商品',
      headerRight: (
        <View style={
          {flexDirection: 'row',
          paddingRight: pxToDp(30)
        }
        }>
        <TouchableOpacity
          onPress={() => {
          }}
        >
        <Text style={{
          fontSize:pxToDp(32),
          color:'#59b26a'
        }}>保存</Text>
        </TouchableOpacity>
      </View>),
    }
  };
  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      full_screen: false,
      product_detail: {},
      store_product: {},
    };
  }

  render(){
    return(
      <View>
        <GoodAttrs  name="基本信息" />
        <Cells >
         <Cell customStyle={[styles.myCell]}>
            <CellHeader>
              <Label style={[styles.cell_label]}>SKU单位</Label>
            </CellHeader>
            <CellBody>
              <Text style={[styles.cell_body]}>555</Text>
            </CellBody>
          </Cell>
          <Cell customStyle={[styles.myCell]}>
            <CellHeader>
              <Label style={[styles.cell_label]}>SKU单位</Label>
            </CellHeader>
            <CellBody>
              <Text style={[styles.cell_body]}>555</Text>
            </CellBody>
          </Cell>

       </Cells>

      </View>
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
          <Text style={{color: '#B2B2B2',fontSize: pxToDp(30)}}>{this.props.name}</Text>
      </View>
    )
  }
}


const styles = StyleSheet.create({
  GoodAttrs:{
    flexDirection: 'row',
    alignItems: 'center',
    height: pxToDp(90),
  
    
  },
  cellBorderBottom:{
    borderBottomWidth: pxToDp(1),
    borderStyle: 'solid',
    borderColor: '#EAEAEA'
  },
  myCell:{
    marginLeft: 0,
    borderColor:colors.new_back,
    paddingHorizontal: pxToDp(30),

  },
  
})

export default connect(mapStateToProps, mapDispatchToProps)(GoodsEditScene)
