import React from "react";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {InputItem, List, Toast} from '@ant-design/react-native'
import pxToDp from "../../util/pxToDp";
import NavigationItem from "../../widget/NavigationItem";
import native from "../../common/native";
import JbbCellTitle from "../component/JbbCellTitle";
import {connect} from "react-redux";
import * as tool from "../../common/tool";
import moment from 'moment'
import WorkerPopup from "../component/WorkerPopup";
import Config from "../../config";
import HttpUtils from "../../util/http";

const Item = List.Item;

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class ProductPutIn extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '商品入库',
      headerLeft: (
        <NavigationItem
          icon={require("../../img/Register/back_.png")}
          onPress={() => native.nativeBack()}
        />
      ),
      headerRight: (
        <NavigationItem
          position={'right'}
          title={'对账单'}
          onPress={() => {
            const params = navigation.state.params
            let url = Config.serverUrl(`/stores/orders_buy_records/${params.userId}/${params.storeId}?a_day=${params.date}`)
            navigation.navigate(Config.ROUTE_WEB, {url: url})
          }}
        />
      ),
    }
  }
  
  constructor (props) {
    super(props)
    const {currStoreName} = tool.vendor(this.props.global);
    this.state = {
      storeId: this.props.global.currStoreId,
      storeName: currStoreName,
      totalPrice: '0',
      number: '0',
      date: moment().format('YYYY-MM-DD'),
      userName: this.props.global.currentUserProfile.screen_name,
      userId: this.props.global.currentUserProfile.id,
      workerPopupVisible: false
    }
  }
  
  componentDidMount () {
    this.props.navigation.setParams({
      storeId: this.props.global.currStoreId,
      userId: this.props.global.currentUserProfile.id,
      date: moment().format('YYYY-MM-DD')
    })
  }
  
  doSubmit () {
    const self = this
    const navigation = this.props.navigation
    const api = `/api/product_put_in?access_token=${self.props.global.accessToken}`
    const data = {
      price: Number(this.state.totalPrice),
      num: Number(this.state.number),
      userId: this.state.userId,
      productId: navigation.state.params.pid,
      storeId: this.state.storeId
    }
    Toast.loading('请求中', 3)
    HttpUtils.post.bind(self.props)(api, data).then(res => {
      Toast.success('操作成功')
      native.nativeBack()
    })
  }
  
  onSetPayUser (worker) {
    this.setState({userName: worker.name, userId: worker.id})
  }
  
  renderInfo () {
    const {productName} = this.props.route.params
    return (
      <View>
        <JbbCellTitle>入库信息</JbbCellTitle>
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>店铺：</Text>
            <Text>{this.state.storeName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>商品：</Text>
            <Text>{productName}</Text>
          </View>
        </View>
      </View>
    )
  }
  
  renderForm () {
    return (
      <List renderHeader={'表单信息'}>
        <InputItem
          defaultValue={this.state.totalPrice}
          type="number"
          onChange={(value) => this.setState({totalPrice: value})}
        >成本总计</InputItem>
        <InputItem
          defaultValue={this.state.number}
          type="number"
          onChange={(value) => this.setState({number: value})}
        >份数</InputItem>
        <Item extra={this.state.date}>入库日期</Item>
        <Item
          extra={this.state.userName}
          arrow={"horizontal"}
          onClick={() => this.setState({workerPopupVisible: true})}
        >付款人</Item>
      </List>
    )
  }
  
  
  renderBody () {
    return (
      <ScrollView>
        {this.renderInfo()}
        {this.renderForm()}
      </ScrollView>
    )
  }
  
  renderBtn () {
    return (
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.footerItem} onPress={() => native.nativeBack()}>
          <View style={[styles.footerBtn, styles.errorBtn]}>
            <Text style={styles.footerBtnText}>取消</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerItem} onPress={() => this.doSubmit()}>
          <View style={[styles.footerBtn, styles.successBtn]}>
            <Text style={styles.footerBtnText}>提交</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
  
  render () {
    const self = this
    return (
      <View style={{flex: 1}}>
        {this.renderBody()}
        {this.renderBtn()}
    
        {/*员工列表*/}
        <WorkerPopup
          multiple={false}
          visible={this.state.workerPopupVisible}
          onClickWorker={(worker) => {
            self.onSetPayUser(worker);
            self.setState({workerPopupVisible: false});
          }}
          onCancel={() => this.setState({workerPopupVisible: false})}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  infoContainer: {
    paddingHorizontal: pxToDp(30),
    backgroundColor: '#fff'
  },
  infoItem: {
    marginVertical: pxToDp(10)
  },
  infoLabel: {
    fontSize: pxToDp(26),
    fontWeight: 'bold'
  },
  footerContainer: {
    flexDirection: 'row',
    height: pxToDp(80),
    width: '100%'
  },
  footerItem: {
    width: '50%',
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

export default connect(mapStateToProps)(ProductPutIn)