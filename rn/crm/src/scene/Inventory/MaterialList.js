import React from "react";
import {Image, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {NavigationItem} from "../../widget";
import {Modal as AntModal} from 'antd-mobile-rn';
import SearchInputBar from "../component/SearchInput";
import pxToDp from "../../util/pxToDp";
import Drawer from 'react-native-drawer'
import color from '../../widget/color'
import moment from 'moment'
import {connect} from "react-redux";
import DatePicker from 'react-native-modal-datetime-picker'
import config from "../../config";
import HttpUtils from "../../util/http";

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
    const today = moment().format('YYYY-MM-DD')
    this.state = {
      headerMenu: false,
      filterStatus: '',
      filterDate: today,
      filterName: '',
      materials: [],
      datePickerVisible: false,
      loading: false
    }
  }
  
  setFilterStatus (value) {
    this.setState({filterStatus: value}, () => this.fetchData())
  }
  
  componentDidMount (): void {
    this.props.navigation.setParams({
      showMenu: () => this.showMenu(),
      onFocusSearchInput: () => this.onFocusSearchInput()
    })
    this.fetchData()
  }
  
  fetchData () {
    const self = this
    const navigation = this.props.navigation
    const accessToken = this.props.global.accessToken
    const api = `/api_products/material_list?access_token=${accessToken}`
    this.setState({loading: true})
    HttpUtils.get.bind(navigation)(api, {
      status: this.state.filterStatus,
      date: this.state.filterDate,
      name: this.state.filterName
    }).then(res => {
      self.setState({materials: res, loading: false})
    })
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
      this.fetchData()
    })
  };
  
  onFocusSearchInput () {
    this.closeControlPanel()
  }
  
  onSearch (value) {
    this.setState({name: value}, () => {
      this.fetchData()
    })
  }
  
  closeControlPanel () {
    this.refs._drawer.close()
  };
  
  openControlPanel = () => {
    this.setState({headerMenu: false})
    this.refs._drawer.open()
  };
  
  toMaterialPutIn () {
    this.props.navigation.navigate(config.ROUTE_INVENTORY_MATERIAL_PUT_IN, {onBack: () => this.fetchData()})
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
                  AntModal.alert('温馨提示', '手机连扫码枪，即可扫码入库')
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
              <Text>{this.state.filterDate}</Text>
              <Image source={require('../../img/calendar.png')} style={{width: 15, height: 15}} resizeMode={'contain'}/>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
  
  renderItem (item) {
    return (
      <View style={[styles.itemWrap]} key={item.key}>
        <View style={[styles.itemLine]}>
          <Text style={[styles.itemTitle]}>{item.sku.name}</Text>
          <Text style={[styles.itemSupplier]}>{item.supplier.name}</Text>
        </View>
        <View style={[styles.itemLine]}>
          <Text>{item.bar_code}</Text>
        </View>
        <View style={[styles.itemLine]}>
          <Text>{item.weight}公斤 {item.price}元</Text>
        </View>
        <View style={[styles.itemLine]}>
          <Text style={[styles.itemDate]}>{item.create_user}：{item.date}</Text>
          <TouchableOpacity onPress={() => console.log(1)}>
            <View>
              <Text style={[styles.itemStatus]}>
                {item.assign_user ? item.assign_user + ':' : null}{item.status_label}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
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
          <ScrollView
            style={{flex: 1}}
            contentContainerStyle={{alignItems: 'center'}}
            refreshControl={
              <RefreshControl onRefresh={() => this.fetchData()} refreshing={this.state.loading}/>
            }
          >
            <For of={this.state.materials} each='item' index='idx'>
              {this.renderItem(item)}
            </For>
          </ScrollView>
        </Drawer>
        {this.renderHeaderMenu()}
        
        <DatePicker
          date={new Date(this.state.filterDate)}
          isVisible={this.state.datePickerVisible}
          onConfirm={this._handleDatePicked}
          onCancel={this._hideDateTimePicker}
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
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#fff',
    margin: 5,
    width: '95%'
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