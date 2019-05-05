import React from "react";
import {Alert, Image, Modal, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {NavigationItem} from "../../widget";
import {Toast} from 'antd-mobile-rn';
import SearchInputBar from "../component/SearchInput";
import pxToDp from "../../util/pxToDp";
import Drawer from 'react-native-drawer'
import color from '../../widget/color'
import moment from 'moment'
import {connect} from "react-redux";
import DatePicker from 'react-native-modal-datetime-picker'
import config from "../../config";
import HttpUtils from "../../util/http";
import WorkerPopup from "../component/WorkerPopup";
import {native, tool} from "../../common";
import Swipeout from 'react-native-swipeout';
import LoadMore from "react-native-loadmore";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class MaterialList extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <SearchInputBar
            containerStyle={{marginRight: 0}}
            onSearch={(v) => navigation.state.params.onSearch(v)}
            onFocus={() => navigation.state.params.onFocusSearchInput()}
          />
        </View>
      ),
      headerRight: (
        <NavigationItem
          containerStyle={{marginLeft: pxToDp(10)}}
          iconStyle={{marginRight: 0}}
          position={"right"}
          icon={require("../../img/more_vert.png")}
          onPress={() => navigation.state.params.showMenu()}
        />
      ),
    }
  };
  
  constructor (props) {
    super(props)
    console.log(this.props.global)
    const store = tool.store(this.props.global)
    console.log(store)
    this.state = {
      store: store,
      headerMenu: false,
      filterStatus: '',
      filterDate: '',
      filterName: '',
      materials: [],
      datePickerVisible: false,
      workerPopup: false,
      selectedItem: {},
      codeFromAndroidTimer: null,
      page: 1,
      isLastPage: false,
      isLoading: false
    }
  }
  
  setFilterStatus (value) {
    this.setState({filterStatus: value}, () => this.onRefresh())
  }
  
  componentDidMount (): void {
    this.props.navigation.setParams({
      showMenu: () => this.showMenu(),
      onFocusSearchInput: () => this.onFocusSearchInput(),
      onSearch: (text) => this.onSearch(text)
    })
    this.fetchData()
    this.getCodeFromAndroid()
  }
  
  componentWillUnmount (): void {
    clearInterval(this.codeFromAndroidTimer)
  }
  
  fetchData () {
    const self = this
    const accessToken = this.props.global.accessToken
    const api = `/api_products/material_list?access_token=${accessToken}`
    this.setState({isLoading: true})
    HttpUtils.get.bind(self.props)(api, {
      page: this.state.page,
      status: this.state.filterStatus,
      date: this.state.filterDate,
      name: this.state.filterName
    }).then(res => {
      let totalPage = res.count / res.pageSize
      let isLastPage = res.page >= totalPage
      let lists = res.page == 1 ? res.lists : this.state.materials.concat(res.lists)
      self.setState({materials: lists, isLoading: false, page: res.page + 1, isLastPage})
    })
  }
  
  onRefresh () {
    this.setState({page: 1}, () => this.fetchData())
  }
  
  // 获取Android
  getCodeFromAndroid () {
    const self = this
    let dealArr = []
    const accessToken = self.props.global.accessToken
    const api = `/api_products/material_put_in?access_token=${accessToken}`
    if (this.codeFromAndroidTimer) {
      clearInterval(this.codeFromAndroidTimer)
    }
    
    
    this.codeFromAndroidTimer = setInterval(function () {
      native.listenScan(function (ok, items) {
        if (ok) {
          const lists = JSON.parse(items)
          for (let obj of lists) {
            if (obj.barCode) {
              console.log('scan item => ', obj)
              if (obj.type === 'IR' && !dealArr.includes(obj.barCode)) {
                dealArr.push(barCode)
                const {skuId, workerId, weight, barCode, datetime} = obj
                HttpUtils.post.bind(self.props)(api, {
                  skuId, weight, barCode, datetime,
                  storeId: self.state.store.id,
                  supplierId: workerId,
                  price: 0,
                  reduceWeight: 0
                }).then(res => {
                  let name = res.name ? res.name : '未知商品'
                  native.clearScan(barCode)
                  native.speakText(`收货${name}${res.weight}公斤`)
                  Toast.success(`收货${name}${res.weight}公斤成功`)
                  self.onRefresh()
                }).catch(e => {
                  if (e.reason === 'BARCODE_EXIST') {
                    native.clearScan(barCode)
                  } else {
                    let idx = dealArr.indexOf(barCode)
                    dealArr.splice(idx, 1)
                  }
                  Toast.offline('录入失败：' + e.reason)
                })
              }
            } else {
              native.clearScan(obj.barCode)
            }
          }
        }
      })
    }, 500)
  }
  
  showMenu () {
    this.setState({headerMenu: true})
    this.closeControlPanel()
  }
  
  _showDateTimePicker = () => this.setState({datePickerVisible: true});
  
  _hideDateTimePicker = () => this.setState({datePickerVisible: false});
  
  _handleDatePicked = (date) => {
    console.log('A date has been picked: ', date);
    this._hideDateTimePicker();
    this.setState({filterDate: moment(date).format('YYYY-MM-DD')}, () => {
      this.onRefresh()
    })
  };
  
  onFocusSearchInput () {
    this.closeControlPanel()
  }
  
  onSearch (value) {
    this.setState({filterName: value}, () => {
      this.onRefresh()
    })
  }
  
  closeControlPanel () {
    this.refs._drawer.close()
  };
  
  openControlPanel = () => {
    this.setState({headerMenu: false})
    this.refs._drawer.open()
  };
  
  onAssignWorker (worker) {
    console.log(worker)
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
  
  toMaterialPutIn () {
    this.props.navigation.navigate(config.ROUTE_INVENTORY_MATERIAL_PUT_IN, {onBack: () => this.onRefresh()})
    this.setState({headerMenu: false})
  }
  
  toStandardPutIn () {
    this.props.navigation.navigate(config.ROUTE_INVENTORY_STANDARD_PUT_IN, {onBack: () => this.onRefresh()})
    this.setState({headerMenu: false})
  }
  
  renderHeaderMenu () {
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
  
  renderStatusFilterBtn (text, value, active) {
    return (
      <TouchableOpacity onPress={() => this.setFilterStatus(value)}>
        <View>
          <Text style={[styles.drawerItemTag, active ? styles.drawerItemTagLight : null]}>{text}</Text>
        </View>
      </TouchableOpacity>
    )
  }
  
  renderDrawerContent () {
    const {filterStatus} = this.state
    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <View style={styles.drawerItem}>
          <Text style={styles.drawerItemLabel}>状态</Text>
          {this.renderStatusFilterBtn('全部', '', filterStatus === '')}
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10}}>
            {this.renderStatusFilterBtn('待分配', 0, filterStatus === 0)}
            {this.renderStatusFilterBtn('已完成', 1, filterStatus === 1)}
            {this.renderStatusFilterBtn('进行中', 2, filterStatus === 2)}
          </View>
        </View>
        <View style={styles.drawerItem}>
          <Text style={styles.drawerItemLabel}>日期</Text>
          <TouchableOpacity onPress={() => this._showDateTimePicker()}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text>{this.state.filterDate ? this.state.filterDate : '选择日期'}</Text>
              <Image source={require('../../img/calendar.png')} style={{width: 15, height: 15}} resizeMode={'contain'}/>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
  
  renderItem (item) {
    const swipeOutBtns = item.type == 1 ? [
      {
        text: '编辑',
        type: 'primary',
        onPress: () => this.props.navigation.navigate(config.ROUTE_INVENTORY_MATERIAL_PUT_IN, {
          receiptId: item.id,
          barCode: item.bar_code,
          datetime: item.created,
          weight: item.weight,
          workerId: item.supplier ? item.supplier.supplier_code : null,
          skuId: item.sku_id,
          onBack: () => this.onRefresh()
        })
      }
    ] : []
    
    return (
      <Swipeout right={swipeOutBtns} autoClose={true} key={item.id} style={{flex: 1}}>
        <View style={[styles.itemWrap]}>
        <View style={[styles.itemLine]}>
          <View style={{flex: 1}}>
            <Text style={[styles.itemTitle]} numberOfLines={3}>{item.sku.name}</Text>
          </View>
          <Text style={[styles.itemSupplier]}>{item.supplier.name}</Text>
        </View>
        <View style={[styles.itemLine]}>
          <Text>{item.type == 1 ? '收货码：' : '商品码：'}{item.bar_code ? item.bar_code : '无'}</Text>
        </View>
        <View style={[styles.itemLine]}>
          <Text>{item.type == 1 ? '重量：' : '数量：'}{item.weight}{item.type == 1 ? '公斤' : '件'} {item.price}元</Text>
        </View>
        <View style={[styles.itemLine]}>
          <Text style={[styles.itemDate]}>{item.create_user.nickname}：{item.date} 收货</Text>
          <TouchableOpacity onPress={() => this.setState({workerPopup: true, selectedItem: item})}>
            <View>
              <Text style={[styles.itemStatus]}>
                {item.assign_user ? item.assign_user.nickname + ':' : null}{item.status_label}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      </Swipeout>
    )
  }
  
  renderList () {
    return (
      <For of={this.state.materials} each='item' index='idx'>
        {this.renderItem(item)}
      </For>
    )
  }
  
  render () {
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
          ref={'_drawer'}
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
        
        <DatePicker
          date={new Date(this.state.filterDate)}
          isVisible={this.state.datePickerVisible}
          onConfirm={this._handleDatePicked}
          onCancel={this._hideDateTimePicker}
        />
  
        <WorkerPopup
          visible={this.state.workerPopup}
          multiple={false}
          onClickWorker={(worker) => this.onAssignWorker(worker)}
          onCancel={() => this.setState({workerPopup: false})}
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
  }
})
export default connect(mapStateToProps)(MaterialList)