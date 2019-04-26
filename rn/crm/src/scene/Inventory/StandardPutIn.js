import BaseComponent from "../BaseComponent";
import React from "react";
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import pxToDp from "../../util/pxToDp";
import {InputItem, List, WhiteSpace} from "antd-mobile-rn";
import SearchPopup from "../component/SearchPopup";
import HttpUtils from "../../util/http";
import {connect} from "react-redux";
import NavigationItem from "../../widget/NavigationItem";
import native from "../../common/native";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class StandardPutIn extends BaseComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '标品入库',
      headerLeft: (
        <NavigationItem
          icon={require("../../img/Register/back_.png")}
          onPress={() => native.nativeBack()}
        />
      )
    }
  }
  
  constructor (props) {
    super(props)
    this.state = {
      product: {},
      supplierPopup: false,
      suppliers: [],
      supplier: {},
      number: '0'
    }
  }
  
  fetchSuppliers () {
    const self = this
    const navigation = this.props.navigation
    const accessToken = this.props.global.accessToken
    const api = `/api_products/material_suppliers?access_token=${accessToken}`
    HttpUtils.get.bind(navigation)(api).then(res => {
      self.setState({suppliers: res})
    })
  }
  
  componentDidMount (): void {
    const navigation = this.props.navigation
    const {params = {}} = navigation.state
    
    this.fetchSuppliers()
    this.listenUpcInterval()
  }
  
  doSubmit () {
  
  }
  
  setUpcListener () {
    return setInterval(function () {
      native.listenScanUpc(function (item) {
        console.log('listen scan upc => ', item)
      })
    }, 500)
  }
  
  listenUpcInterval () {
    const self = this
    this.timer = this.setUpcListener()
  }
  
  renderProdInfo () {
    return (
      <View>
        <View style={[styles.cell_box]}>
          <View style={styles.cell}>
            <If condition={this.props.image}>
              <Image style={[styles.goods_image]} source={{uri: this.state.product.image}}/>
            </If>
            <View style={[styles.item_right]}>
              <Text style={[styles.goods_name]}>{this.state.product.name}</Text>
              <View style={styles.sku}>
              
              </View>
            </View>
            <TouchableOpacity>
              <View style={styles.arrow}>
                <Image source={require('../../assets/back_arrow.png')}/>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }
  
  renderInput () {
    return (
      <List>
        <List.Item
          arrow="horizontal"
          onClick={() => this.setState({supplierPopup: true})}
          extra={this.state.supplier.name}
        >供货商</List.Item>
        <InputItem
          extra={'件'}
          value={this.state.number}
          defaultValue={this.state.number}
          onChange={(number) => this.setState({number})}
        >数量</InputItem>
      </List>
    )
  }
  
  renderBtn () {
    return (
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.footerItem} onPress={() => this.doSubmit()}>
          <View style={[styles.footerBtn, styles.successBtn]}>
            <Text style={styles.footerBtnText}>入库</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
  
  render () {
    return (
      <ScrollView
        contentContainerStyle={{flex: 1, justifyContent: 'space-between'}}
        style={{flex: 1}}
      >
        <View>
          {this.renderProdInfo()}
          <WhiteSpace/>
          {this.renderInput()}
        </View>
        
        {this.renderBtn()}
        
        <SearchPopup
          visible={this.state.supplierPopup}
          dataSource={this.state.suppliers}
          title={'选择供应商'}
          onClose={() => this.setState({supplierPopup: false})}
          onSelect={(item) => this.setState({
            supplier: item,
            supplierPopup: false
          })}
        />
      </ScrollView>
    )
      ;
  }
}

const styles = StyleSheet.create({
  cell_box: {
    paddingHorizontal: pxToDp(30),
    paddingVertical: pxToDp(26),
    backgroundColor: '#ffffff'
  },
  cell: {
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: '#eeeeee',
    flexDirection: 'row',
  },
  goods_image: {
    width: pxToDp(120),
    height: pxToDp(120)
  },
  item_right: {
    flex: 1,
    height: pxToDp(120),
    marginLeft: pxToDp(20),
    justifyContent: 'space-between',
  },
  sku: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  arrow: {
    width: pxToDp(40),
    flex: 1,
    justifyContent: 'center'
  },
  footerContainer: {
    flexDirection: 'row',
    height: pxToDp(80),
    width: '100%'
  },
  footerItem: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  footerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%'
  },
  successBtn: {
    backgroundColor: '#59b26a'
  },
  errorBtn: {
    backgroundColor: '#e94f4f'
  },
  footerBtnText: {
    color: '#fff'
  }
})

export default connect(mapStateToProps)(StandardPutIn)