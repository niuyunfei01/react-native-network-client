import React from 'react'
import {
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {connect} from "react-redux";
import pxToDp from "../../../pubilc/util/pxToDp";
import tool from "../../../pubilc/util/tool";
import Dialog from "../../common/component/Dialog";
import {Provider, WhiteSpace} from "@ant-design/react-native";
import {Button, Switch} from "react-native-elements";
import HttpUtils from "../../../pubilc/util/http";
import Swipeout from 'react-native-swipeout';
import JbbPrompt from "../../common/component/JbbPrompt";
import ModalSelector from "react-native-modal-selector";
import SearchProduct from "../../../pubilc/component/SearchProduct";
import JbbTimeRange from "../../common/component/JbbTimeRange";
import _ from "lodash";
import {showError, ToastShort} from "../../../pubilc/util/ToastUtils";
import colors from "../../../pubilc/styles/colors";
import Entypo from "react-native-vector-icons/Entypo";
import JbbModal from "../../../pubilc/component/JbbModal";
import Ionicons from "react-native-vector-icons/Ionicons";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import Scanner from "../../../pubilc/component/Scanner";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

const width = Dimensions.get("window").width;

class ProductInfo extends React.Component {

  constructor(props) {
    super(props)
    const pid = this.props?.route?.params?.pid
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
      saleDayCyclePrompt: false,
      packLossWarnPrompt: false,
      riskMinStatVocPrompt: false,
      riskMinStatPrompt: false,
      skuRefineLevels: [],
      skuFreshDegrees: [],
      refer_prod_id: 0,
      referred_by: [],
      refProdPrompt: false, // 关联商品
      referredPrompt: false, //被关联商品
      showDeliveryModal: false,
      shelf_no: '',
      scanBoolean: false
    }

  }

  componentDidMount = () => {
    this.fetchShelfNos()
    this.fetchSkuRefineLevel()
    this.fetchData()
    this.fetchSkuFreshDegree()
  }

  fetchShelfNos = () => {
    const self = this
    const api = `/api_products/inventory_shelf_nos?access_token=${this.props.global.accessToken}`
    HttpUtils.get.bind(self.props)(api, {
      productId: self.state.productId,
      storeId: self.state.storeId
    }).then(res => {
      self.setState({shelfNos: res})
    })
  }

  fetchSkuRefineLevel = () => {
    const self = this
    const api = `/api_products/sku_refine_level_options?access_token=${this.props.global.accessToken}`
    HttpUtils.get.bind(self.props)(api).then(res => {
      self.setState({skuRefineLevels: res})
    })
  }

  fetchSkuFreshDegree = () => {
    const self = this
    const api = `/api_products/sku_fresh_degree_options?access_token=${this.props.global.accessToken}`
    HttpUtils.get.bind(self.props)(api).then(res => {
      self.setState({skuFreshDegrees: res})
    })
  }

  fetchData = () => {
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
        selectShelfNo: res?.shelf_no,
        isStandard: !!res?.product.upc,
        refer_prod_id: res?.refer_prod_id,
        referred_by: res?.referred_by
      })
    })
  }

  _baseRequest = (api, params, ok) => {
    const self = this
    let uri = `${api}?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(self.props)(uri, params).then(res => {
      ToastShort('操作成功')
      self.fetchData()
      ok && ok()
    })
  }

  onModifyPosition = (value) => {
    this._baseRequest('/api_products/modify_inventory_shelf_no', {
      productId: this.state.productId,
      storeId: this.state.storeId,
      shelfNo: value
    })
  }

  onClearShelfNo = () => {
    this._baseRequest('/api_products/clear_inventory_shelf_no', {
      productId: this.state.productId,
      storeId: this.state.storeId
    })
  }

  onChgTagCode = (val) => {
    this._baseRequest('/api_products/chg_sku_tag_code', {
      skuId: this.state.productInfo.sku.id,
      tagCode: val
    }, () => this.setState({tagCodePrompt: false}))
  }

  onConfirmUpc = (upc) => {
    this._baseRequest('/api_products/chg_prod_upc', {
      productId: this.state.productId,
      upc: upc
    }, () => this.setState({upcPrompt: false}))
  }

  onChangeNeedPack = (checked) => {
    const self = this
    const api = `/api_products/chg_sku_need_pack?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      skuId: self.state.productInfo.sku.id,
      storeId: self.state.storeId,
      need_pack: checked ? 1 : 0
    }).then(res => {
      ToastShort('操作成功')
      self.fetchData()
    })
  }

  onChgPrePackScore = (value) => {
    const self = this
    const api = `/api_products/chg_prod_pre_pack_score?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      productId: self.state.productId,
      prePackScore: value
    }).then(res => {
      this.setState({packScorePrompt: false})
      ToastShort('操作成功')
      self.fetchData()
    })
  }

  onChgStockCheckCycle = (value) => {
    const self = this
    const api = `/api_products/chg_sku_stock_check_cycle?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      skuId: self.state.productInfo.sku.id,
      cycle: value
    }).then(res => {
      this.setState({stockCheckCyclePrompt: false})
      ToastShort('操作成功')
      self.fetchData()
    })
  }

  onChgSkuPackLossWarn = (value) => {
    const self = this
    const api = `/api_products/chg_sku_pack_loss_warn?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      skuId: self.state.productInfo.sku.id,
      value: value
    }).then(res => {
      this.setState({packLossWarnPrompt: false})
      ToastShort('操作成功')
      self.fetchData()
    })
  }

  onChgStoreProdRiskMinStat = (value) => {
    const self = this
    const api = `/api_products/chg_store_prod_risk_min_stat?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      storeProdId: self.state.productInfo.id,
      value: value
    }).then(res => {
      this.setState({riskMinStatPrompt: false})
      ToastShort('操作成功')
      self.fetchData()
    })
  }

  onChgStoreProdRiskMinStatVoc = (value) => {
    const self = this
    const api = `/api_products/chg_store_prod_risk_min_stat_voc?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      storeProdId: self.state.productInfo.id,
      value: value
    }).then(res => {
      this.setState({riskMinStatVocPrompt: false})
      ToastShort('操作成功')
      self.fetchData()
    })
  }

  onChgSkuRefineLevel = (value) => {
    const self = this
    const api = `/api_products/chg_sku_refine_level?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      skuId: self.state.productInfo.sku.id,
      value: value
    }).then(res => {
      ToastShort('操作成功')
      self.fetchData()
    })
  }

  onChgStoreProdUnitNum = (productId, unitNum) => {
    this._baseRequest('/api_products/chg_sp_refer_prod', {
      product_id: this.state.productInfo.product_id,
      refer_product_id: productId,
      unit_num: unitNum
    }, () => this.setState({unitNumPrompt: false, refProdPrompt: false, refer_prod_id: productId}))
  }

  onChgSkuFreshDegree = (value) => {
    this._baseRequest('/api_products/chg_sku_fresh_degree', {
      skuId: this.state.productInfo.sku.id,
      value,
      product_id: this.state.productInfo.product_id
    })
  }

  onChgSkuSaleDays = (value) => {
    this._baseRequest('/api_products/chg_sku_sale_days', {
      skuId: this.state.productInfo.sku.id,
      value
    }, () => this.setState({saleDayCyclePrompt: false}))
  }

  onSaveProductSaleTime = (value) => {
    let times = []
    value.map((item) => item.start && item.end ? times.push(`${item.start}-${item.end}`) : null)
    this._baseRequest('/api_products/save_product_sale_time', {
      product_id: this.state.productId,
      store_id: this.state.storeId,
      available_times: times.join(',')
    })
  }

  startScan = () => {
    this.setState({
      scanBoolean: true,
      showDeliveryModal: false
    });
  };

  onScanSuccess = (code) => {
    if (code) {
      this.setState({
        showDeliveryModal: true
      }, () => {
        this.setState({
          shelf_no: code
        })
      })
    }
  }

  onScanFail = () => {
    Alert.alert('错误提示', '货架码不合法，请重新扫描', [
      {
        text: '确定', onPress: () => {
        }
      },
    ]);
  }

  renderScanner = () => {
    const {scanBoolean} = this.state
    return (
      <Scanner visible={scanBoolean} title="返回"
               onClose={() => this.setState({scanBoolean: false})}
               onScanSuccess={code => this.onScanSuccess(code)}
               onScanFail={code => this.onScanFail(code)}/>
    )
  }

  renderHeader = () => {
    return (
      <View style={{marginTop: pxToDp(10)}}>
        <View style={styles.item_body}>
          <View style={[styles.item_head]}>
            <Text style={styles.item_title}>商品信息 </Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.item_title}>店铺：</Text>
            <Text style={{color: colors.color333}}>{this.state.storeName} </Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.item_title}>商品ID: </Text>
            <Text style={{color: colors.color333}}>(#{this.state.productId}) </Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.item_title}>商品名称: </Text>
            <Text style={{color: colors.color333}}>{this.state.productInfo.product.name} </Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.item_title}>店铺成本：</Text>
            <Text style={{color: colors.color333}}>{this.state.productInfo.store_cost}元 </Text>
          </View>
        </View>
      </View>
    )
  }

  renderForm = () => {
    const {productInfo} = this.state
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
        <View style={styles.item_body}>
          <View style={[styles.item_head, {flexDirection: "row", justifyContent: "space-between"}]}>
            <Text style={styles.item_title}>库管信息 </Text>
            <View style={[styles.itemRow, {paddingRight: 10}]}>
              <Text style={{color: colors.color333}}>标品</Text>
              <Switch onValueChange={(checked) => {
                this.setState({isStandard: checked})
              }} color={colors.main_color} value={this.state.isStandard}
              />
            </View>
          </View>
          <TouchableOpacity onPress={() => {
            this.setState({showDeliveryModal: true})
          }} style={[styles.itemRow, {justifyContent: "space-between", paddingVertical: 5}]}>
            <Text style={styles.item_title}>货架编号: </Text>
            <View style={styles.itemRow}>
              <Text style={styles.row_right}>{productInfo?.shelf_no || '输入货架编号'}</Text>
              <Entypo name="chevron-thin-right" style={[styles.row_right, {fontSize: 19, marginRight: 10}]}/>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.setState({stockCheckCyclePrompt: true})}
                            style={[styles.itemRow, {justifyContent: "space-between"}]}>
            <Text style={styles.item_title}>盘点周期: </Text>
            <View style={styles.itemRow}>
              <Text
                style={styles.row_right}>{productInfo?.sku?.stock_check_cycle > 0 ? `${productInfo?.sku?.stock_check_cycle}天` : '无'}</Text>
              <Entypo name="chevron-thin-right" style={[styles.row_right, {fontSize: 19, marginRight: 10}]}/>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.setState({saleDayCyclePrompt: true})}
                            style={[styles.itemRow, {justifyContent: "space-between"}]}>
            <Text style={styles.item_title}>售卖天数: </Text>
            <View style={styles.itemRow}>
              <Text
                style={styles.row_right}>{productInfo?.sku?.sale_days > 0 ? `${productInfo?.sku?.sale_days}天` : '不限'}</Text>
              <Entypo name="chevron-thin-right" style={[styles.row_right, {fontSize: 19, marginRight: 10}]}/>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.setState({riskMinStatVocPrompt: true})}
                            style={[styles.itemRow, {justifyContent: "space-between"}]}>
            <Text style={styles.item_title}>忙日最低库存: </Text>
            <View style={styles.itemRow}>
              <Text style={styles.row_right}>{productInfo?.risk_min_stat_voc}</Text>
              <Entypo name="chevron-thin-right" style={[styles.row_right, {fontSize: 19, marginRight: 10}]}/>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.setState({riskMinStatPrompt: true})}
                            style={[styles.itemRow, {justifyContent: "space-between"}]}>
            <Text style={styles.item_title}>闲日最低库存: </Text>
            <View style={styles.itemRow}>
              <Text style={styles.row_right}>{productInfo?.risk_min_stat}</Text>
              <Entypo name="chevron-thin-right" style={[styles.row_right, {fontSize: 19, marginRight: 10}]}/>
            </View>
          </TouchableOpacity>
          <If condition={!productInfo.is_standard_code}>
            <View style={[styles.itemRow, {justifyContent: "space-between", marginRight: 20}]}>
              <Text style={styles.item_title}>品名(货号): </Text>
              <Text style={styles.row_right}>{productInfo?.sku.name}({this.state.productInfo?.sku?.id})</Text>
            </View>
            <TouchableOpacity onPress={() => this.setState({tagCodePrompt: true})}
                              style={[styles.itemRow, {justifyContent: "space-between"}]}>
              <Text style={styles.item_title}>秤签编号: </Text>
              <View style={styles.itemRow}>
                <Text style={styles.row_right}>{productInfo?.sku?.material_code}</Text>
                <Entypo name="chevron-thin-right" style={[styles.row_right, {fontSize: 19, marginRight: 10}]}/>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.setState({tagCodePrompt: true})}
                              style={[styles.itemRow, {justifyContent: "space-between", paddingRight: 10}]}>
              <Text style={styles.item_title}>需要打包: </Text>
              <Switch onValueChange={(checked) => {
                this.onChangeNeedPack(checked)
              }} color={colors.main_color} value={this.state.productInfo.sku.need_pack == 1}
              />
            </TouchableOpacity>
          </If>
          <If condition={productInfo?.sku?.need_pack == 1}>
            <TouchableOpacity onPress={() => this.setState({packScorePrompt: true})}
                              style={[styles.itemRow, {justifyContent: "space-between"}]}>
              <Text style={styles.item_title}>打包工分: </Text>
              <View style={styles.itemRow}>
                <Text style={styles.row_right}>{productInfo?.product?.pre_pack_score}</Text>
                <Entypo name="chevron-thin-right" style={[styles.row_right, {fontSize: 19, marginRight: 10}]}/>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.setState({packLossWarnPrompt: true})}
                              style={[styles.itemRow, {justifyContent: "space-between"}]}>
              <Text style={styles.item_title}>打包损耗预警: </Text>
              <View style={styles.itemRow}>
                <Text style={styles.row_right}>{tool.toFixed(productInfo?.sku?.pack_loss_warn, 'percent')}</Text>
                <Entypo name="chevron-thin-right" style={[styles.row_right, {fontSize: 19, marginRight: 10}]}/>
              </View>
            </TouchableOpacity>

            <ModalSelector
              onChange={(option) => this.onChgSkuRefineLevel(option.value)}
              cancelText={'取消'}
              data={this.state.skuRefineLevels}
            >
              <View style={[styles.itemRow, {justifyContent: "space-between"}]}>
                <Text style={styles.item_title}>打包级别: </Text>
                <View style={styles.itemRow}>
                  <Text style={styles.row_right}>{productInfo?.sku?.refine_level_label}</Text>
                  <Entypo name="chevron-thin-right" style={[styles.row_right, {fontSize: 19, marginRight: 10}]}/>
                </View>
              </View>
            </ModalSelector>
          </If>
          <If condition={this.state.isStandard}>
            <TouchableOpacity onPress={() => this.setState({upcPrompt: true})}
                              style={[styles.itemRow, {justifyContent: "space-between"}]}>
              <Text style={styles.item_title}>商品码: </Text>
              <View style={styles.itemRow}>
                <Text style={styles.row_right}>{productInfo?.product.upc}</Text>
                <Entypo name="chevron-thin-right" style={[styles.row_right, {fontSize: 19, marginRight: 10}]}/>
              </View>
            </TouchableOpacity>
          </If>
          <If condition={!_.isEmpty(this.state.referred_by)}>
            <TouchableOpacity onPress={() => this.setState({referredPrompt: true})}
                              style={[styles.itemRow, {justifyContent: "space-between"}]}>
              <Text style={styles.item_title}>被关联商品数: </Text>
              <View style={styles.itemRow}>
                <Text style={styles.row_right}>{Object.keys(this.state.referred_by).length}</Text>
                <Entypo name="chevron-thin-right" style={[styles.row_right, {fontSize: 19, marginRight: 10}]}/>
              </View>
            </TouchableOpacity>
          </If>
          <ModalSelector
            onChange={(option) => this.onChgSkuFreshDegree(option.value)}
            cancelText={'取消'}
            data={this.state.skuFreshDegrees}
          >
            <TouchableOpacity onPress={() => this.setState({refProdPrompt: true})}
                              style={[styles.itemRow, {justifyContent: "space-between"}]}>
              <Text style={styles.item_title}>温区: </Text>
              <View style={styles.itemRow}>
                <Text style={styles.row_right}>{productInfo?.sku?.fresh_degree_label}</Text>
                <Entypo name="chevron-thin-right" style={[styles.row_right, {fontSize: 19, marginRight: 10}]}/>
              </View>
            </TouchableOpacity>
          </ModalSelector>
          <JbbTimeRange
            onConfirm={(ranges) => this.onSaveProductSaleTime(ranges)}
            value={this.state.saleTimes}
          >
            <View style={[styles.itemRow, {justifyContent: "space-between"}]}>
              <Text style={styles.item_title}>设置可售时间: </Text>
              <View style={styles.itemRow}>
                <Text style={styles.row_right}>{this.state.saleTimes[0]?.start}-{this.state.saleTimes[0]?.end}</Text>
                <Entypo name="chevron-thin-right" style={[styles.row_right, {fontSize: 19, marginRight: 10}]}/>
              </View>
            </View>
          </JbbTimeRange>
          <If condition={this.state.productInfo.refer_prod_id}>
            <JbbPrompt
              autoFocus={true}
              title={'输入每份相当于关联商品的份数'}
              onConfirm={(value) => this.onChgStoreProdUnitNum(this.state.productInfo.refer_prod_id, value)}
              onCancel={() => this.setState({unitNumPrompt: false})}
              initValue={productInfo.unit_num}
            >
              <View style={[styles.itemRow, {justifyContent: "space-between"}]}>
                <Text style={styles.item_title}>设置份含量: </Text>
                <View style={styles.itemRow}>
                  <Text style={styles.row_right}>{productInfo?.unit_num}份含量</Text>
                  <Entypo name="chevron-thin-right" style={[styles.row_right, {fontSize: 19, marginRight: 10}]}/>
                </View>
              </View>
            </JbbPrompt>
          </If>
          <If condition={!_.isEmpty(this.state.referred_by)}>
            <Swipeout right={refProductSwipeOutBtns} autoClose={true}>
              <View style={[styles.itemRow, {justifyContent: "space-between"}]}>
                <Text style={styles.item_title}>关联库存商品: </Text>
                <View style={styles.itemRow}>
                  <Text style={styles.row_right}>{productInfo?.refer_prod_name}</Text>
                  <Text style={styles.row_right}>左滑取消关联</Text>
                </View>
              </View>
            </Swipeout>
          </If>
        </View>
        {/*<List>*/}
        {/*  <Picker*/}
        {/*    data={this.state.shelfNos}*/}
        {/*    title="选择货架"*/}
        {/*    cascade={false}*/}
        {/*    extra={productInfo.shelf_no}*/}
        {/*    onOk={v => this.onModifyPosition(v.join(''))}>*/}
        {/*    <List.Item arrow="horizontal">货架编号</List.Item>*/}
        {/*  </Picker>*/}
        {/*</List>*/}
      </View>
    )
  }

  isValid(str) {
    return '' === str || /[@|#|-|_|+|*]/.test(str) || /^[\w|\s]*$/.test(str);
  }

  filterShelfNo = (text) => {

    if (this.isValid(text)) {
      this.setState({shelf_no: text})
      return
    }
    showError('输入有误，请重新输入', 1)
  }

  renderModal = () => {
    return (
      <JbbModal visible={this.state.showDeliveryModal}
                onClose={() => this.setState({showDeliveryModal: false})} modal_type={'center'}>
        <KeyboardAwareScrollView enableAutomaticScroll={false}>
          <Text style={{fontWeight: 'bold', fontSize: pxToDp(30), lineHeight: pxToDp(60)}}>
            请输入或扫描填入货架码
          </Text>

          <View style={styles.shlfOnModal}>
            <TextInput
              underlineColorAndroid="transparent"
              style={[{marginLeft: 10, height: 40, flex: 1, borderWidth: 1, borderColor: colors.back_color}]}
              placeholderTextColor={"#7A7A7A"}
              value={this.state.shelf_no}
              keyboardType={'email-address'}
              placeholder={'请扫描或输入货架码'}
              onChangeText={text => this.filterShelfNo(text)}
            />
            <Ionicons name={'scan-sharp'} style={styles.rightEmptyView} color={colors.color333} size={22}
                      onPress={() => this.startScan()}/>
          </View>

          <View style={styles.shlfOnModal}>
            <Button title={'确定'}
                    onPress={() => {
                      this.onModifyPosition(this.state.shelf_no)
                      this.setState({showDeliveryModal: false})
                    }}
                    buttonStyle={styles.modalBtnSure}
                    titleStyle={styles.modalText}
            />
            <Button title={'取消'}
                    onPress={() => {
                      this.setState({showDeliveryModal: false})
                    }}
                    buttonStyle={styles.modalBtnCancel}
                    titleStyle={styles.modalText}
            />
          </View>

        </KeyboardAwareScrollView>
      </JbbModal>
    )
  }

  render(): React.ReactNode {
    return (
      <Provider>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => this.fetchData()}
            />
          } style={styles.container}>
          {this.renderHeader()}
          <WhiteSpace/>
          {this.renderForm()}
          {this.renderScanner()}
          <JbbPrompt
            autoFocus={true}
            title={'输入秤签编号'}
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
            title={'输入售卖天数'}
            onConfirm={(value) => this.onChgSkuSaleDays(value)}
            onCancel={() => this.setState({saleDayCyclePrompt: false})}
            initValue={this.state.productInfo.sku.sale_days}
            visible={this.state.saleDayCyclePrompt}
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

          <Dialog visible={this.state.referredPrompt} onRequestClose={() => this.setState({referredPrompt: false})}>
            {this.state.referred_by && tool.objectMap(this.state.referred_by, (item, idx) => {
              return (
                <View key={idx}><Text
                  style={{color: colors.color333}}>{item.name}#{item.id} 份含量: {item.unit_num} </Text></View>
              );
            })}
          </Dialog>
          {this.renderModal()}
        </ScrollView>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.main_back, paddingVertical: 12, paddingHorizontal: 10
  },
  item_body: {
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 10,
  },
  item_head: {
    borderBottomWidth: 1,
    paddingBottom: 2,
    borderColor: colors.colorCCC
  },
  item_title: {
    color: colors.color333,
    padding: 12,
    fontSize: 15,
    fontWeight: 'bold',
  },
  itemRow: {flexDirection: "row", alignItems: "center"},
  row_label: {
    fontSize: 14,
    color: colors.color333,
    flex: 1,
  },
  row_label_desc: {
    fontSize: 12,
    color: colors.color999,
    marginTop: 2,
  },
  row_right: {
    color: colors.color999
  },
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
  },
  shlfOnModal: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15
  },
  modalBtnCancel: {
    width: width * 0.3,
    marginLeft: width * 0.2,
    borderRadius: pxToDp(10),
    backgroundColor: colors.gray,
  },
  modalBtnSure: {
    width: width * 0.3,
    borderRadius: pxToDp(10),
    backgroundColor: colors.main_color,
  },
  modalText: {
    color: colors.white,
    fontSize: 16
  },
  rightEmptyView: {
    textAlign: 'center',
    width: 40,
  }
})

export default connect(mapStateToProps)(ProductInfo)
