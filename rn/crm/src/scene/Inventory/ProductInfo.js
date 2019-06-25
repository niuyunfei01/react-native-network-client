import React from 'react'
import {RefreshControl, ScrollView, StyleSheet, Text, View} from "react-native";
import NavigationItem from "../../widget/NavigationItem";
import native from "../../common/native";
import {connect} from "react-redux";
import JbbCellTitle from "../component/JbbCellTitle";
import pxToDp from "../../util/pxToDp";
import {tool} from "../../common";
import {List, Picker, Switch, Toast, WhiteSpace} from "antd-mobile-rn";
import HttpUtils from "../../util/http";
import Swipeout from 'react-native-swipeout';
import JbbPrompt from "../component/JbbPrompt";
import ModalSelector from "react-native-modal-selector";
import SearchProduct from "../component/SearchProduct";
import JbbTimeRange from "../component/JbbTimeRange";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}


class ProductInfo extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '库管详情',
      headerLeft: (
        <NavigationItem
          icon={require("../../img/Register/back_.png")}
          onPress={() => native.nativeBack()}
        />
      )
    }
  };
  
  constructor (props) {
    super(props)
    const pid = this.props.navigation.state.params.pid
    const store = tool.store(this.props.global)
    this.state = {
      productId: pid,
      productInfo: {
        product: {},
        sku: {}
      },
      saleTimes: [],
      shelfNos: [[{label: '', value: ''}], [{label: '', value: ''}]],
      selectShelfNo: [],
      storeId: store.id,
      storeName: store.name,
      positionDialog: false,
      shelfArea: '',
      shelfNo: '',
      refreshing: false,
      tagCodePrompt: false,
      isStandard: false, // 是否是标品
      upcPrompt: false,
      packScorePrompt: false,
      stockCheckCyclePrompt: false,
      packLossWarnPrompt: false,
      riskMinStatVocPrompt: false,
      riskMinStatPrompt: false,
      skuRefineLevels: [],
      skuFreshDegrees: [],
      refProdPrompt: false, // 关联商品
    }
  }
  
  componentDidMount (): void {
    this.fetchShelfNos()
    this.fetchSkuRefineLevel()
    this.fetchData()
    this.fetchSkuFreshDegree()
  }
  
  componentWillUnmount (): void {
  }
  
  fetchShelfNos () {
    const self = this
    const api = `/api_products/inventory_shelf_nos?access_token=${this.props.global.accessToken}`
    HttpUtils.get.bind(self.props)(api, {
      productId: self.state.productId,
      storeId: self.state.storeId
    }).then(res => {
      self.setState({shelfNos: res})
    })
  }
  
  fetchSkuRefineLevel () {
    const self = this
    const api = `/api_products/sku_refine_level_options?access_token=${this.props.global.accessToken}`
    HttpUtils.get.bind(self.props)(api).then(res => {
      self.setState({skuRefineLevels: res})
    })
  }
  
  fetchSkuFreshDegree () {
    const self = this
    const api = `/api_products/sku_fresh_degree_options?access_token=${this.props.global.accessToken}`
    HttpUtils.get.bind(self.props)(api).then(res => {
      self.setState({skuFreshDegrees: res})
    })
  }
  
  fetchData () {
    const self = this
    const api = `/api_products/inventory_info?access_token=${this.props.global.accessToken}`
    self.setState({refreshing: true})
    HttpUtils.get.bind(self.props)(api, {
      productId: self.state.productId,
      storeId: self.state.storeId
    }).then(res => {
      let saleTimes = []
      if (res.availableTimes && res.availableTimes != '') {
        let timeStrings = res.availableTimes.split(',')
        if (timeStrings.length) {
          timeStrings.map(item => {
            let t = item.split('-')
            saleTimes.push({start: t[0], end: t[1]})
          })
        }
      }
      self.setState({
        saleTimes,
        productInfo: res,
        refreshing: false,
        selectShelfNo: res.shelf_no,
        isStandard: !!res.product.upc
      })
    })
  }
  
  _baseRequest (api, params, ok) {
    const self = this
    let uri = `${api}?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(self.props)(uri, params).then(res => {
      Toast.success('操作成功')
      self.fetchData()
      ok && ok()
    })
  }
  
  onModifyPosition (value) {
    this._baseRequest('/api_products/modify_inventory_shelf_no', {
      productId: this.state.productId,
      storeId: this.state.storeId,
      shelfNo: value
    })
  }
  
  onClearShelfNo () {
    this._baseRequest('/api_products/clear_inventory_shelf_no', {
      productId: this.state.productId,
      storeId: this.state.storeId
    })
  }
  
  onChgTagCode (val) {
    this._baseRequest('/api_products/chg_sku_tag_code', {
      skuId: this.state.productInfo.sku.id,
      tagCode: val
    }, () => this.setState({tagCodePrompt: false}))
  }
  
  onConfirmUpc (upc) {
    this._baseRequest('/api_products/chg_prod_upc', {
      productId: this.state.productId,
      upc: upc
    }, () => this.setState({upcPrompt: false}))
  }
  
  onChangeNeedPack (checked) {
    const self = this
    const api = `/api_products/chg_sku_need_pack?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      skuId: self.state.productInfo.sku.id,
      storeId: self.state.storeId,
      need_pack: checked ? 1 : 0
    }).then(res => {
      Toast.success('操作成功')
      self.fetchData()
    })
  }
  
  onChgPrePackScore (value) {
    const self = this
    const api = `/api_products/chg_prod_pre_pack_score?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      productId: self.state.productId,
      prePackScore: value
    }).then(res => {
      this.setState({packScorePrompt: false})
      Toast.success('操作成功')
      self.fetchData()
    })
  }
  
  onChgStockCheckCycle (value) {
    const self = this
    const api = `/api_products/chg_sku_stock_check_cycle?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      skuId: self.state.productInfo.sku.id,
      cycle: value
    }).then(res => {
      this.setState({stockCheckCyclePrompt: false})
      Toast.success('操作成功')
      self.fetchData()
    })
  }
  
  onChgSkuPackLossWarn (value) {
    const self = this
    const api = `/api_products/chg_sku_pack_loss_warn?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      skuId: self.state.productInfo.sku.id,
      value: value
    }).then(res => {
      this.setState({packLossWarnPrompt: false})
      Toast.success('操作成功')
      self.fetchData()
    })
  }
  
  onChgStoreProdRiskMinStat (value) {
    const self = this
    const api = `/api_products/chg_store_prod_risk_min_stat?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      storeProdId: self.state.productInfo.id,
      value: value
    }).then(res => {
      this.setState({riskMinStatPrompt: false})
      Toast.success('操作成功')
      self.fetchData()
    })
  }
  
  onChgStoreProdRiskMinStatVoc (value) {
    const self = this
    const api = `/api_products/chg_store_prod_risk_min_stat_voc?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      storeProdId: self.state.productInfo.id,
      value: value
    }).then(res => {
      this.setState({riskMinStatVocPrompt: false})
      Toast.success('操作成功')
      self.fetchData()
    })
  }
  
  onChgSkuRefineLevel (value) {
    const self = this
    const api = `/api_products/chg_sku_refine_level?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      skuId: self.state.productInfo.sku.id,
      value: value
    }).then(res => {
      Toast.success('操作成功')
      self.fetchData()
    })
  }
  
  onChgStoreProdUnitNum (productId, unitNum) {
    this._baseRequest('/api_products/chg_sp_refer_prod', {
      product_id: this.state.productInfo.product_id,
      refer_product_id: productId,
      unit_num: unitNum
    }, () => this.setState({unitNumPrompt: false, refProdPrompt: false}))
  }
  
  onChgSkuFreshDegree (value) {
    this._baseRequest('/api_products/chg_sku_fresh_degree', {skuId: this.state.productInfo.sku.id, value})
  }
  
  onSaveProductSaleTime (value) {
    let times = []
    value.map((item) => item.start && item.end ? times.push(`${item.start}-${item.end}`) : null)
    this._baseRequest('/api_products/save_product_sale_time', {
      product_id: this.state.productId,
      store_id: this.state.storeId,
      available_times: times.join(',')
    })
  }
  
  renderHeader () {
    return (
      <View>
        <JbbCellTitle>商品信息</JbbCellTitle>
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>店铺：</Text>
            <Text>{this.state.storeName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>商品：(ID:#{this.state.productId})</Text>
            <Text>{this.state.productInfo.product.name}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>店铺成本：{this.state.productInfo.store_cost}元</Text>
          </View>
        </View>
      </View>
    )
  }
  
  renderForm () {
    const shelfNoSwipeOutBtns = [
      {
        text: '清除',
        type: 'delete',
        onPress: () => this.onClearShelfNo()
      }
    ]
  
    const refProductSwipeOutBtns = [
      {
        text: '取消关联',
        onPress: () => this.onChgStoreProdUnitNum(0, 1)
      }
    ]
    
    return (
      <View>
        <View style={styles.formHeader}>
          <Text>库管信息</Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text>标品</Text>
            <Switch
              checked={this.state.isStandard}
              onChange={(checked) => this.setState({isStandard: checked})}
            />
          </View>
        </View>
        <List>
          <Swipeout right={shelfNoSwipeOutBtns} autoClose={true}>
            <Picker
              data={this.state.shelfNos}
              title="选择货架"
              cascade={false}
              extra={this.state.productInfo.shelf_no}
              onOk={v => this.onModifyPosition(v.join(''))}
            >
              <List.Item arrow="horizontal">货架编号</List.Item>
            </Picker>
          </Swipeout>
          <List.Item
            arrow={"horizontal"}
            extra={`${this.state.productInfo.sku.stock_check_cycle}天`}
            onClick={() => this.setState({stockCheckCyclePrompt: true})}
          >盘点周期</List.Item>
          <List.Item
            arrow={"horizontal"}
            extra={`${this.state.productInfo.risk_min_stat_voc}`}
            onClick={() => this.setState({riskMinStatVocPrompt: true})}
          >忙日最低库存</List.Item>
          <List.Item
            arrow={"horizontal"}
            extra={`${this.state.productInfo.risk_min_stat}`}
            onClick={() => this.setState({riskMinStatPrompt: true})}
          >闲日最低库存</List.Item>
  
          <List.Item
            arrow={"horizontal"}
            extra={`${this.state.productInfo.sku.name}(${this.state.productInfo.sku.id})`}
          >秤签名称</List.Item>
          <List.Item
            onClick={() => this.setState({tagCodePrompt: true})}
            arrow={"horizontal"}
            extra={this.state.productInfo.sku.material_code}
          >秤签编号</List.Item>
          <List.Item
            extra={<Switch
              disabled={!this.state.productInfo.sku.material_code}
              checked={this.state.productInfo.sku.need_pack == 1}
              onChange={(checked) => this.onChangeNeedPack(checked)}
            />}
          >需要打包</List.Item>
          <If condition={this.state.productInfo.sku.need_pack == 1}>
            <List.Item
              arrow={"horizontal"}
              extra={this.state.productInfo.product.pre_pack_score}
              onClick={() => this.setState({packScorePrompt: true})}
            >打包工分</List.Item>
            <List.Item
              arrow={"horizontal"}
              extra={tool.toFixed(this.state.productInfo.sku.pack_loss_warn, 'percent')}
              onClick={() => this.setState({packLossWarnPrompt: true})}
            >打包损耗预警</List.Item>
            <ModalSelector
              onChange={(option) => this.onChgSkuRefineLevel(option.value)}
              cancelText={'取消'}
              data={this.state.skuRefineLevels}
            >
              <List.Item
                arrow="horizontal"
                extra={this.state.productInfo.sku.refine_level_label}
              >打包级别</List.Item>
            </ModalSelector>
          </If>
  
          <If condition={this.state.isStandard}>
            <List.Item
              onClick={() => this.setState({upcPrompt: true})}
              extra={this.state.productInfo.product.upc}
              arrow="horizontal"
            >商品码</List.Item>
          </If>
  
          <JbbPrompt
            autoFocus={true}
            title={'输入商品单份含量'}
            onConfirm={(value) => this.onChgStoreProdUnitNum(this.state.productInfo.refer_prod_id, value)}
            onCancel={() => this.setState({unitNumPrompt: false})}
            initValue={this.state.productInfo.unit_num}
          >
            <List.Item
              extra={this.state.productInfo.unit_num}
              arrow="horizontal"
            >商品份含量</List.Item>
          </JbbPrompt>
          <Swipeout right={refProductSwipeOutBtns} autoClose={true}>
          <List.Item
            onClick={() => this.setState({refProdPrompt: true})}
            extra={this.state.productInfo.refer_prod_name}
            arrow="horizontal"
          >关联单份商品</List.Item>
          </Swipeout>
          <ModalSelector
            onChange={(option) => this.onChgSkuFreshDegree(option.value)}
            cancelText={'取消'}
            data={this.state.skuFreshDegrees}
          >
            <List.Item
              onClick={() => this.setState({refProdPrompt: true})}
              extra={this.state.productInfo.sku.fresh_degree_label}
              arrow="horizontal"
            >保鲜程度</List.Item>
          </ModalSelector>
  
          <JbbTimeRange
            onConfirm={(ranges) => this.onSaveProductSaleTime(ranges)}
            value={this.state.saleTimes}
          >
            <List.Item
              extra={'设置可售时间'}
              arrow="horizontal"
            >可售时间</List.Item>
          </JbbTimeRange>
        </List>
      </View>
    )
  }
  
  render (): React.ReactNode {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={() => this.fetchData()}
          />
        }>
        {this.renderHeader()}
        <WhiteSpace/>
        {this.renderForm()}
  
        <JbbPrompt
          onConfirm={(value) => this.onChgTagCode(value)}
          onCancel={() => this.setState({tagCodePrompt: false})}
          initValue={this.state.productInfo.sku.material_code}
          visible={this.state.tagCodePrompt}
        />
  
        <JbbPrompt
          autoFocus={true}
          title={'输入标品商品码'}
          onConfirm={(value) => this.onConfirmUpc(value)}
          onCancel={() => this.setState({upcPrompt: false})}
          initValue={''}
          visible={this.state.upcPrompt}
        />
  
        <JbbPrompt
          autoFocus={true}
          title={'输入打包工分'}
          onConfirm={(value) => this.onChgPrePackScore(value)}
          onCancel={() => this.setState({packScorePrompt: false})}
          initValue={this.state.productInfo.product.pre_pack_score}
          visible={this.state.packScorePrompt}
        />
  
        <JbbPrompt
          autoFocus={true}
          title={'输入盘点周期'}
          onConfirm={(value) => this.onChgStockCheckCycle(value)}
          onCancel={() => this.setState({stockCheckCyclePrompt: false})}
          initValue={this.state.productInfo.sku.stock_check_cycle}
          visible={this.state.stockCheckCyclePrompt}
        />
  
        <JbbPrompt
          autoFocus={true}
          title={'输入打包损耗阈值(%)'}
          onConfirm={(value) => this.onChgSkuPackLossWarn(value)}
          onCancel={() => this.setState({packLossWarnPrompt: false})}
          initValue={(this.state.productInfo.sku.pack_loss_warn * 100).toFixed(2)}
          visible={this.state.packLossWarnPrompt}
        />
  
        <JbbPrompt
          autoFocus={true}
          title={'输入忙日风险库存'}
          onConfirm={(value) => this.onChgStoreProdRiskMinStatVoc(value)}
          onCancel={() => this.setState({riskMinStatVocPrompt: false})}
          initValue={this.state.productInfo.risk_min_stat_voc}
          visible={this.state.riskMinStatVocPrompt}
        />
  
        <JbbPrompt
          autoFocus={true}
          title={'输入闲日风险库存'}
          onConfirm={(value) => this.onChgStoreProdRiskMinStat(value)}
          onCancel={() => this.setState({riskMinStatPrompt: false})}
          initValue={this.state.productInfo.risk_min_stat}
          visible={this.state.riskMinStatPrompt}
        />
  
  
        <SearchProduct
          visible={this.state.refProdPrompt}
          onCancel={() => this.setState({refProdPrompt: false})}
          onSelect={product => this.onChgStoreProdUnitNum(product.id, this.state.productInfo.unit_num)}
        />
      </ScrollView>
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
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: pxToDp(20),
    height: pxToDp(50)
  }
})

export default connect(mapStateToProps)(ProductInfo)