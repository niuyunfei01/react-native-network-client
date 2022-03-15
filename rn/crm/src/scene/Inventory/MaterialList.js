import React from "react";
import {
  Alert,
  DeviceEventEmitter,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {NavigationItem} from "../../widget";
import {Toast} from '@ant-design/react-native';
import SearchInputBar from "../component/SearchInput";
import pxToDp from "../../util/pxToDp";
import Drawer from 'react-native-drawer'
import color from '../../widget/color'
import {connect} from "react-redux";
import DatePicker from 'react-native-modal-datetime-picker'
import config from "../../config";
import C from "../../config";
import HttpUtils from "../../util/http";
import {native, tool} from "../../common";
import Swipeout from 'react-native-swipeout';
import LoadMore from "react-native-loadmore";
import PackDetail from "./_MaterialList/PackDetail";
import {ToastShort} from "../../util/ToastUtils";
import JbbInput from "../component/JbbInput";
import ReceiptDetail from "./_MaterialList/ReceiptDetail";
import ActiveWorkerPopup from "../component/ActiveWorkerPopup";
import _ from 'lodash'
import ReceiptOpLog from "./_MaterialList/ReceiptOpLog";
import ModalSelector from "react-native-modal-selector";
import JbbButton from "../component/JbbButton";
import {CommonActions} from '@react-navigation/native';
import dayjs from "dayjs";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

const MENU_KEY_REBUILD_TASK = 1
const MENU_KEY_RESET_LOSS = 2
const MENU_KEY_ENTRY_FINISH = 3
const MORE_MENU = [
  {'label': '重新生成打包任务', 'key': MENU_KEY_REBUILD_TASK},
  {'label': '重新计算损耗', 'key': MENU_KEY_RESET_LOSS},
  {'label': '置为入库完成', 'key': MENU_KEY_ENTRY_FINISH}
]

class MaterialList extends React.Component {
  constructor(props) {
    super(props)
    const store = tool.store(this.props.global)
    this.state = {
      storeId: store ? store.id : 0,
      headerMenu: false,
      filterStatus: '',
      filterDate: '',
      filterName: '',
      filterLossPercent: '',
      filterSupplyPriceHigh: false,
      materials: [],
      datePickerVisible: false,
      workerPopup: false,
      selectedItem: {},
      detailItems: {},
      codeFromAndroidTimer: null,
      page: 1,
      isLastPage: false,
      isLoading: false,
      packDetailDialog: false,
      receiptDetailDialog: false,
      receiptOpLogDialog: false
    }

    this.navigationOptions(this.props)
    this._drawerRef = React.createRef();
  }

  navigationOptions = ({navigation, route}) => {
    navigation.setOptions({
      headerTitle: () => {
        return <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <SearchInputBar
            containerStyle={{marginRight: 0}}
            onSearch={(v) => this.onSearch(v)}
            onFocus={() => this.onFocusSearchInput()}
          />
        </View>
      },
      headerRight: () => {
        return <NavigationItem
          containerStyle={{marginLeft: pxToDp(10)}}
          iconStyle={{marginRight: 0}}
          position={"right"}
          icon={require("../../img/more_vert.png")}
          onPress={() => this.showMenu()}
        />
      },
    })
  };

  setFilterStatus(value) {
    this.setState({filterStatus: value}, () => this.onRefresh())
  }

  componentDidMount(): void {
    this.props.navigation.dispatch(CommonActions.setParams({
      showMenu: () => this.showMenu(),
      onFocusSearchInput: () => this.onFocusSearchInput(),
      onSearch: (text) => this.onSearch(text)
    }));
    this.fetchData()
    this.getCodeFromAndroid()
  }

  componentWillUnmount(): void {
    this.listenScanPackProd.remove()
  }

  fetchData() {
    const self = this
    const accessToken = this.props.global.accessToken
    const api = `/api_products/material_list?access_token=${accessToken}`
    this.setState({isLoading: true})
    HttpUtils.get.bind(self.props)(api, {
      page: this.state.page,
      status: this.state.filterStatus,
      date: this.state.filterDate,
      name: this.state.filterName,
      lossPercent: this.state.filterLossPercent / 100,
      supplyPriceHigh: this.state.filterSupplyPriceHigh
    }).then(res => {
      let totalPage = res.count / res.pageSize
      let isLastPage = res.page >= totalPage
      let lists = res.page == 1 ? res.lists : this.state.materials.concat(res.lists)
      self.setState({materials: lists, isLoading: false, page: res.page + 1, isLastPage})
    })
  }

  onFetchDetail(item) {
    const self = this
    const accessToken = this.props.global.accessToken
    const api = `/api_products/inventory_entry_detail_v2/${item.id}?access_token=${accessToken}`
    this.setState({isLoading: true})
    HttpUtils.get.bind(self.props)(api).then(res => {
      if (res && Object.keys(res).length > 0) {
        this.setState({packDetailDialog: true, detailItems: res, selectedItem: item})
      } else {
        ToastShort('无打包任务详情')
        self.props.onClickClose()
      }
    })
  }

  onRefresh() {
    this.setState({page: 1}, () => this.fetchData())
  }

  // 获取Android
  getCodeFromAndroid() {
    const self = this
    if (this.listenScanPackProd) {
      this.listenScanPackProd.remove()
    }
    let dealArr = []
    const accessToken = self.props.global.accessToken
    const api = `/api_products/material_put_in?access_token=${accessToken}`
    this.listenScanPackProd = DeviceEventEmitter.addListener(C.Listener.KEY_SCAN_PACK_PROD_BAR_CODE, function (obj) {
      if (obj.type === 'IR' && !dealArr.includes(obj.barCode)) {
        const {skuId, workerId, weight, barCode, datetime} = obj
        dealArr.push(barCode)
        HttpUtils.post.bind(self.props)(api, {
          skuId, weight, barCode, datetime,
          storeId: self.state.storeId,
          supplierId: workerId,
          price: 0,
          reduceWeight: 0
        }).then(res => {
          let name = res.name ? res.name : '未知商品'
          native.speakText(`收货${name}${res.weight}公斤`)
          ToastShort(`成功收货${name}${res.weight}公斤`)
          self.onRefresh()
        }).catch(e => {
          if (e.reason !== 'BARCODE_EXIST') {
            let idx = dealArr.indexOf(barCode)
            dealArr.splice(idx, 1)
          }
          Toast.offline('录入失败：' + e.reason)
        })
      } else {
        Toast.offline('录入失败：该条码以录入')
      }
    })
  }

  showMenu() {
    this.setState({headerMenu: true})
    this.closeControlPanel()
  }

  _showDateTimePicker = () => this.setState({datePickerVisible: true});

  _hideDateTimePicker = () => this.setState({datePickerVisible: false});

  _handleDatePicked = (date) => {
    this._hideDateTimePicker();
    this.setState({filterDate: dayjs(date).format('YYYY-MM-DD')}, () => {
      this.onRefresh()
    })
  };

  onFocusSearchInput() {
    this.closeControlPanel()
  }

  onSearch(value) {
    this.setState({filterName: value}, () => {
      this.onRefresh()
    })
  }

  closeControlPanel() {
    if (this._drawerRef.current != null && this._drawerRef.current.close) {
      this._drawerRef.current.close()
    }
  };

  openControlPanel = () => {
    this.setState({headerMenu: false})
    if (this._drawerRef.current != null && this._drawerRef.current.open) {
      this._drawerRef.current.open()
    }
  };

  onAssignWorker(worker) {
    const self = this
    const accessToken = this.props.global.accessToken
    const api = `/api_products/material_assign_task?access_token=${accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      receiptId: this.state.selectedItem.id,
      userId: worker.id
    }).then(res => {
      Toast.success('操作成功')
      self.setState({selectedItem: {}, workerPopup: false})
      self.fetchData()
    })
  }

  toMaterialPutIn() {
    this.props.navigation.navigate(config.ROUTE_INVENTORY_MATERIAL_PUT_IN, {onBack: () => this.onRefresh()})
    this.setState({headerMenu: false})
  }

  toStandardPutIn() {
    this.props.navigation.navigate(config.ROUTE_INVENTORY_STANDARD_PUT_IN, {onBack: () => this.onRefresh()})
    this.setState({headerMenu: false})
  }

  onDisabledReceipt(item, idx) {
    const self = this
    Alert.alert('警告', `确定将此条记录置为无效么\n【${item.sku.name}】${item.weight}${item.type == 1 ? '公斤' : '件'} \n 置为无效后，如果是标品需要减去相应库存`, [
      {text: '取消'},
      {
        text: '确定',
        onPress: () => {
          const accessToken = this.props.global.accessToken
          const api = `/api_products/material_disabled/${item.id}?access_token=${accessToken}`
          HttpUtils.post.bind(self.props)(api).then(res => {
            Toast.success('操作成功')
            const {materials} = self.state
            materials.splice(idx, 1)
            self.setState({materials})
          })
        }
      }
    ])
  }

  _handleMoreOperation(option, item) {
    switch (option.key) {
      case MENU_KEY_REBUILD_TASK:
        this._doRebuildReceiptTask(item)
        return
      case MENU_KEY_RESET_LOSS:
        this._doResetReceiptLoss(item)
        return
      case MENU_KEY_ENTRY_FINISH:
        this._doFinishEntry(item)
        return
      default:
        break
    }
  }

  _doRebuildReceiptTask(item) {
    const self = this
    const accessToken = this.props.global.accessToken
    const api = `/api_products/material_rebuild_task/${item.id}?access_token=${accessToken}`
    HttpUtils.post.bind(self.props)(api).then(res => {
      ToastShort('操作成功')
      self.onRefresh()
    })
  }

  _doResetReceiptLoss(item) {
    const self = this
    const accessToken = this.props.global.accessToken
    const api = `/api_products/material_reset_loss/${item.id}?access_token=${accessToken}`
    HttpUtils.post.bind(self.props)(api).then(res => {
      ToastShort('操作成功')
      self.onRefresh()
    })
  }

  _doFinishEntry(item) {
    const self = this
    const accessToken = this.props.global.accessToken
    const api = `/api_products/inventory_entry_finish/${item.id}?access_token=${accessToken}`
    HttpUtils.post.bind(self.props)(api).then(res => {
      ToastShort('操作成功')
      self.onRefresh()
    })
  }

  renderHeaderMenu() {
    return (
      <Modal
        visible={this.state.headerMenu}
        animationType={'fade'}
        transparent={true}
        onRequestClose={() => this.setState({headerMenu: false})}
      >
        <TouchableOpacity style={{flex: 1}} onPress={() => this.setState({headerMenu: false})}>
          <View style={styles.headerMenuModalBackground}>
            <View style={styles.headerMenuContainer}>
              <View style={styles.headerMenuItems}>
                <TouchableOpacity onPress={() => {
                  this.setState({headerMenu: false})
                  Alert.alert('温馨提示', '手机连扫码枪，即可扫码入库')
                }}>
                  <View style={styles.headerMenuItem}>
                    <Text style={styles.headerMenuItemText}>扫码入库</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.toMaterialPutIn()}>
                  <View style={styles.headerMenuItem}>
                    <Text style={styles.headerMenuItemText}>手动入库</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.toStandardPutIn()}>
                  <View style={styles.headerMenuItem}>
                    <Text style={styles.headerMenuItemText}>标品入库</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.openControlPanel()}>
                  <View style={styles.headerMenuItem}>
                    <Text style={styles.headerMenuItemText}>筛选</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    )
  }

  renderStatusFilterBtn(text, value, active) {
    return (
      <TouchableOpacity onPress={() => this.setFilterStatus(value)}>
        <View>
          <Text style={[styles.drawerItemTag, active ? styles.drawerItemTagLight : null]}>{text}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  renderDrawerContent() {
    const {filterStatus, filterSupplyPriceHigh} = this.state
    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <ScrollView>
          <View style={styles.drawerItem}>
            <Text style={styles.drawerItemLabel}>状态</Text>
            {this.renderStatusFilterBtn('全部', '', filterStatus === '')}
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10}}>
              {this.renderStatusFilterBtn('待分配', 0, filterStatus === 0)}
              {this.renderStatusFilterBtn('进行中', 1, filterStatus === 1)}
              {this.renderStatusFilterBtn('已完成', 2, filterStatus === 2)}
            </View>
          </View>
          <View style={styles.drawerItem}>
            <Text style={styles.drawerItemLabel}>日期</Text>
            <TouchableOpacity onPress={() => this._showDateTimePicker()}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <Text>{this.state.filterDate ? this.state.filterDate : '选择日期'}</Text>
                <Image source={require('../../img/calendar.png')} style={{width: 15, height: 15}}
                       resizeMode={'contain'}/>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.drawerItem}>
            <Text style={styles.drawerItemLabel}>损耗</Text>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text>高于百分比(%)</Text>
              <JbbInput
                styles={styles.filterInput}
                onChange={(value) => this.setState({filterLossPercent: value})}
                value={this.state.filterLossPercent}
                keyboardType={'numeric'}
                onBlur={() => this.onRefresh()}
              />
            </View>
          </View>
          <View style={styles.drawerItem}>
            <TouchableOpacity onPress={() => this.setState({filterSupplyPriceHigh: !filterSupplyPriceHigh})}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  style={{width: 20, height: 20}}
                  source={filterSupplyPriceHigh ? require('../../img/checked.png') : require('../../img/checked_disable.png')}
                />
                <Text>成本高于保底价</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <JbbButton
          text={'筛选'}
          onPress={() => {
            this.onRefresh();
            this.closeControlPanel()
          }}
          backgroundColor={color.theme}
          fontColor={'#fff'}
          fontWeight={'bold'}
        />
      </View>
    )
  }

  renderItem(item, idx) {
    let swipeOutBtns = []
    swipeOutBtns.push({
      text: '无效',
      type: 'delete',
      onPress: () => this.onDisabledReceipt(item, idx)
    })

    return (
      <Swipeout right={swipeOutBtns} autoClose={true} key={item.id} style={{flex: 1}}>
        <View style={[styles.itemWrap]}>
          <View style={[styles.itemLine]}>
            <View style={{flex: 1}}>
              <Text style={[styles.itemTitle]} numberOfLines={3}>{item.sku.name}</Text>
            </View>
            {item.logs.length ? (
              <TouchableOpacity onPress={() => this.setState({selectedItem: item, receiptOpLogDialog: true})}>
                <View>
                  <Text style={[styles.itemSupplier]}>修改记录</Text>
                </View>
              </TouchableOpacity>) : (
              <Text style={[styles.itemSupplier, {backgroundColor: color.fontGray}]}>无修改</Text>
            )}
          </View>
          <If condition={item.bar_code}>
            <View style={[styles.itemLine]}>
              <Text style={styles.itemText}>
                {item.type == 1 ? '收货码：' : '商品码：'}{item.bar_code ? item.bar_code : '无'}
              </Text>
            </View>
          </If>
          <View style={[styles.itemLine]}>
            <Text style={styles.itemText}>
              {item.type == 1 ? '重量：' : '数量：'}{item.weight}{item.type == 1 ? '公斤 | ' : '件 | '}
              {item.price}元
            </Text>
          </View>
          <View style={[styles.itemLine]}>
            <Text style={styles.itemText}>
              {`打包重量：${item.pack_weight}公斤 | `}
              {`调货：${item.transfer_weight}公斤 | `}
              {`损耗：${tool.toFixed(item.pack_loss_weight, 'yuan')}公斤`}
            </Text>
          </View>
          <View style={[styles.itemLine]}>
            <Text style={styles.itemText}>
              {`损耗金额：${item.pack_loss_price}元 | `}
              <Text style={item.pack_loss_warning ? {color: '#e94f4f'} : ''}>
                {`损耗率：${tool.toFixed(item.pack_loss_percent, 'percent')}`}
              </Text>
            </Text>
          </View>
          <If condition={item.packers.length}>
            <TouchableOpacity onPress={() => this.onFetchDetail(item)}>
              <View style={[styles.itemLine]}>
                <Text style={styles.itemText}>
                  打包员：{_.map(item.packers, 'nickname').join(',')}
                </Text>
              </View>
            </TouchableOpacity>
          </If>
          <TouchableOpacity onPress={() => this.setState({selectedItem: item, receiptDetailDialog: true})}>
            <View style={[styles.itemLine]}>
              <Text style={[styles.itemText]}>
                收货人：{_.map(item.detail, row => row.creator.nickname).join(',')}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={[styles.itemLine]}>
            <Text style={[styles.itemDate]}>收货日期：{item.date} </Text>
            <TouchableOpacity onPress={() => this.setState({workerPopup: true, selectedItem: item})}>
              <View>
                <Text style={[styles.itemStatus]}>
                  {item.status_label}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={[styles.itemLine, styles.itemFooter]}>
            <ModalSelector
              onChange={(option) => this._handleMoreOperation(option, item)}
              cancelText={'取消'}
              data={MORE_MENU}
            >
              <Text style={[styles.itemMoreOperation]}>更多操作</Text>
            </ModalSelector>
          </View>
        </View>
      </Swipeout>
    )
  }

  renderList() {
    return (
      <For of={this.state.materials} each='item' index='idx'>
        {this.renderItem(item, idx)}
      </For>
    )
  }

  render() {
    const drawerStyles = {
      drawer: {
        shadowColor: '#000000',
        shadowOpacity: 0.8,
        shadowRadius: 3,
        borderLeftWidth: 1,
        borderLeftColor: color.theme
      }
    }

    return (
      <View style={{flex: 1}}>
        <Drawer
          type="overlay"
          side={'right'}
          content={this.renderDrawerContent()}
          tapToClose={true}
          openDrawerOffset={0.4}
          panCloseMask={0.4}
          closedDrawerOffset={-3}
          styles={drawerStyles}
          tweenHandler={(ratio) => ({
            main: {opacity: (2 - ratio) / 2}
          })}
          ref={this._drawerRef}
        >
          <LoadMore
            renderList={this.renderList()}
            onRefresh={() => this.onRefresh()}
            isLastPage={this.state.isLastPage}
            isLoading={this.state.isLoading}
            loadMoreType={'scroll'}
            onLoadMore={() => this.fetchData()}
          />
        </Drawer>
        {this.renderHeaderMenu()}
        {/*日期弹窗*/}
        <DatePicker
          date={new Date(this.state.filterDate)}
          isVisible={this.state.datePickerVisible}
          onConfirm={this._handleDatePicked}
          onCancel={this._hideDateTimePicker}
        />
        {/*打卡的员工*/}
        <ActiveWorkerPopup
          visible={this.state.workerPopup}
          multiple={false}
          onClickWorker={(worker) => this.onAssignWorker(worker)}
          onCancel={() => this.setState({workerPopup: false})}
        />
        {/*打包记录*/}
        <PackDetail
          details={this.state.detailItems}
          item={this.state.selectedItem}
          visible={this.state.packDetailDialog}
          onClickClose={() => this.setState({packDetailDialog: false})}
        />
        {/*收货详情*/}
        <ReceiptDetail
          item={this.state.selectedItem}
          visible={this.state.receiptDetailDialog}
          onClickClose={() => this.setState({receiptDetailDialog: false})}
        />
        {/*操作明细*/}
        <ReceiptOpLog
          item={this.state.selectedItem}
          visible={this.state.receiptOpLogDialog}
          onClickClose={() => this.setState({receiptOpLogDialog: false})}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerMenuModalBackground: {
    flex: 1
  },
  headerMenuContainer: {
    width: '100%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20
  },
  headerMenuTitle: {
    width: '100%'
  },
  headerMenuItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  headerMenuItem: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 5,
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    width: 60
  },
  headerMenuItemText: {
    color: '#fff',
    fontSize: 12
  },
  drawerItem: {
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  drawerItemLabel: {
    fontWeight: 'bold'
  },
  drawerItemTag: {
    backgroundColor: '#ddd',
    color: '#000',
    paddingVertical: 5,
    width: 50,
    textAlign: 'center',
    borderRadius: 10
  },
  drawerItemTagLight: {
    backgroundColor: color.theme,
    color: '#fff',
  },
  filterInput: {
    height: 18,
    fontSize: 12,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginHorizontal: 0
  },
  itemWrap: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#bbb',
    width: '100%'
  },
  itemLine: {
    height: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000'
  },
  itemSupplier: {
    backgroundColor: color.theme,
    color: '#fff',
    fontSize: 10,
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2
  },
  itemDate: {
    color: '#000'
  },
  itemStatus: {
    fontSize: 12
  },
  itemFooter: {
    borderTopWidth: pxToDp(1),
    borderTopColor: '#d9d9d9'
  },
  itemMoreOperation: {
    fontSize: 12,
    color: color.theme
  }
})
export default connect(mapStateToProps)(MaterialList)
