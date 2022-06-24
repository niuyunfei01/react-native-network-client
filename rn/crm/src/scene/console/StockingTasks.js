import React, {PureComponent} from "react";
import {FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import colors from '../../pubilc/styles/colors'
import ModalSelector from "../../pubilc/component/ModalSelector";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import LinearGradient from 'react-native-linear-gradient'
import {connect} from "react-redux";
import HttpUtils from "../../pubilc/util/http";
import {ToastShort} from "../../pubilc/util/ToastUtils";


function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

class StockingTasks extends PureComponent {

  state = {
    stall: {
      id: '',
      label: '全部摊位'
    },
    stockList: [],//备货列表
    stallArray: [],//摊位数组
    selectType: '1',//1-待备货，2-已备货
    selectItem: -1,
    page: 1,
    pageSize: 10,
    isLastPage: false,
    isLoading: false
  }

  constructor(props) {
    super(props);
    const {stall, stallArray} = this.state
    this.navigationSetting(stall, stallArray)
  }

  navigationSetting = (stall, stallArray) => {
    const {navigation} = this.props;

    const options = {headerTitle: () => this.renderHeader(stall, stallArray)}
    navigation.setOptions(options)
  }

  componentDidMount() {

    this.getStallData()
    const {page, stall, selectType} = this.state
    this.getStallList(page, stall, selectType, false)
  }

  getStallData = () => {
    const {currStoreId, accessToken} = this.props.global;
    const url = `/api_products/get_stall_by_store_id?access_token=${accessToken}`
    const {stall} = this.state
    const params = {store_id: currStoreId}
    HttpUtils.get.bind(this.props)(url, params).then(res => {
      const stallArray = []
      stallArray.push({id: '', value: '', label: '全部摊位'})
      res && res.map(item => {
        stallArray.push({...item, value: item.id, label: item.name})
      })

      this.setState({stallArray: stallArray}, () => this.navigationSetting(stall, stallArray))
    })
  }

  getStallList = (page, stall, selectType, isGetMore) => {
    const {currStoreId, accessToken} = this.props.global;
    const {pageSize, isLoading, stockList} = this.state
    if (isLoading)
      return
    this.setState({isLoading: true})
    const params = {
      store_id: currStoreId,
      stall_id: stall.id,
      status: selectType,
      page: page,
      pageSize: pageSize
    }
    const url = `/api_products/stall_supply_lists?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(url, params).then(res => {
      this.setState({
        isLastPage: res.isLastPage,
        isLoading: false,
        stockList: isGetMore ? stockList.concat(res.lists) : res.lists
      })
    }).catch(() => {
      this.setState({isLoading: false})
    })
  }

  onChange = (stall) => {
    this.setState({stall: stall})
    const {page, selectType, stallArray} = this.state
    this.navigationSetting(stall, stallArray)
    this.getStallList(page, stall, selectType, false)
  }

  renderHeader = (stall, stallArray) => {
    return (
      <View style={styles.header}>
        <ModalSelector onChange={value => this.onChange(value)}
                       data={stallArray}
                       skin="customer"
                       style={styles.selectWrap}
                       defaultKey={-999}>

          <Text style={styles.selectText}>
            {stall.label}
          </Text>
        </ModalSelector>
        <FontAwesome5 name={'angle-down'} size={16}/>
      </View>
    )
  }

  selectItem = (selectItem, index) => {
    this.setState({selectItem: selectItem !== index ? index : -1})
  }
  renderExtraView = (remark, list, time, selectType, id) => {
    return (
      <View style={styles.extraViewWrap}>
        <View style={styles.remarkWrap}>
          <Text style={styles.itemTitle}>
            客户备注
          </Text>
          <Text style={styles.remark}>
            {remark}
          </Text>
        </View>
        <View style={styles.padding12}>
          <Text style={styles.itemTitle}>
            商品列表
          </Text>
          {
            list.map((item, index) => {
              const numStyle = item.num > 1 ? styles.itemDetailNumMany : styles.itemDetailNumNormal
              const spec = item.spec ? `[${item.spec}]` : ''
              return (
                <View key={index} style={styles.itemDetailRow}>
                  <Image source={{uri: item.coverimg}} style={styles.platformIcon}/>
                  <View style={{marginLeft: 17, flex: 1}}>
                    <Text style={styles.itemDetailTitle}>
                      {item.name}{spec}
                    </Text>
                    <Text style={styles.itemDetailPrice}>
                      {item.price}
                    </Text>
                  </View>
                  <Text style={numStyle}>
                    x{item.origin_num}
                  </Text>
                </View>
              )
            })
          }
          <If condition={selectType === '2'}>
            <Text style={styles.stallSuccessText}>
              {time}备货完成
            </Text>
          </If>
          <If condition={selectType === '1'}>
            <TouchableOpacity style={styles.stallSuccessBtn} onPress={() => this.stallSuccessBtn(id)}>
              <Text style={styles.stallSuccessBtnText}>
                备货完成
              </Text>
            </TouchableOpacity>
          </If>
        </View>
      </View>
    )
  }

  stallSuccessBtn = (id) => {
    const {accessToken} = this.props.global;
    const url = `/api_products/stall_supply_complete?access_token=${accessToken}`
    const params = {id: id}
    const {page, stall, selectType} = this.state
    HttpUtils.post.bind(this.props)(url, params).then(() => {
      ToastShort('备货完成')
      this.getStallList(page, stall, selectType, false)
    })
  }

  renderItem = (item) => {
    const {dayId, status, id, stall_name, items, product_num, stock_up_time, platformIcon, remark} = item.item
    const {selectItem, selectType} = this.state
    const time = status === '2' ? stock_up_time.substring(10) : ''
    return (
      <If condition={selectType === status}>
        <View style={styles.itemWrap}>
          <TouchableOpacity onPress={() => this.selectItem(selectItem, item.index)}>
            <LinearGradient style={styles.itemMasterWrap} start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                            colors={['#FFFAF7', '#FFE4D0']}>
              <View>
                <View style={[styles.row, {alignItems: 'flex-end'}]}>
                  <Image source={{uri: platformIcon}} style={styles.platformIcon}/>
                  <Text style={styles.flag}>
                    #
                  </Text>
                  <Text style={styles.dayId}>
                    {dayId}
                  </Text>
                </View>
                <If condition={status === '2'}>
                  <Text style={styles.alreadyStock}>
                    {time}备货完成
                  </Text>
                </If>
                <If condition={status === '1'}>
                  <Text style={styles.prepareStock}>
                    待备货
                  </Text>
                </If>
              </View>
              <Text style={styles.stallName}>
                {stall_name}
              </Text>
              <View>
                <Text style={styles.totalNum}>
                  共{product_num}件
                </Text>
                <If condition={selectItem !== item.index}>
                  <View style={[styles.row, {alignItems: 'flex-end'}]}>
                    <Text style={styles.itemToggle}>
                      展开
                    </Text>
                    <FontAwesome5 name={'angle-down'} size={16}/>
                  </View>
                </If>
                <If condition={selectItem === item.index}>
                  <View style={[styles.row, {alignItems: 'flex-end'}]}>
                    <Text style={styles.itemToggle}>
                      收起
                    </Text>
                    <FontAwesome5 name={'angle-up'} size={16}/>
                  </View>
                </If>
              </View>
            </LinearGradient>

          </TouchableOpacity>
          <If condition={selectItem === item.index}>
            {this.renderExtraView(remark, items, time, selectType, id)}
          </If>
        </View>
      </If>
    )
  }

  selectType = (selectType) => {
    this.setState({
      selectType: selectType,
      selectItem: -1
    })
    const {stall} = this.state
    this.getStallList(1, stall, selectType, false)
  }

  renderSelectItem = (selectType) => {
    return (
      <View style={styles.renderSelectItemWrap}>
        <TouchableOpacity style={'1' === selectType ? styles.selectedItem : styles.notSelectItem}
                          onPress={() => this.selectType('1')}>
          <Text style={'1' === selectType ? styles.selectedItemText : styles.notSelectedItemText}>
            待备货
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={'2' === selectType ? styles.selectedItem : styles.notSelectItem}
                          onPress={() => this.selectType('2')}>
          <Text style={'2' === selectType ? styles.selectedItemText : styles.notSelectedItemText}>
            已备货
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  onEndReached = () => {
    const {isLastPage, page, stall} = this.state
    if (isLastPage) {
      ToastShort("暂无更多数据")
      return;
    }
    this.setState({page: page + 1})
    this.getStallList(page + 1, stall, false)
  }
  onRefresh = () => {
    const {stall, selectType} = this.state
    this.getStallList(1, stall, selectType, false)
  }
  renderList = (isLoading, stockList) => {
    return (
      <FlatList data={stockList}
                style={{marginBottom: 10}}
                onEndReachedThreshold={0.1}
                onEndReached={this.onEndReached}
                onRefresh={this.onRefresh}
                refreshing={isLoading}
                initialNumToRender={5}
                ListEmptyComponent={() => this.listEmpty()}
                renderItem={(item) => this.renderItem(item)}
                keyExtractor={(item, index) => `${index}`}
      />
    )
  }

  listEmpty = () => {
    const {selectType} = this.state
    const tip = selectType === '1' ? '暂无待备货订单' : '暂无已备货订单'
    return (
      <View style={styles.listEmptyWrap}>
        <FontAwesome5 name={'list-alt'} style={styles.listEmptyIcon}/>
        <Text style={styles.listEmptyText}>
          {tip}
        </Text>
      </View>
    )
  }

  render() {
    const {selectType, isLoading, stockList} = this.state
    return (
      <>
        {this.renderSelectItem(selectType)}
        {this.renderList(isLoading, stockList)}
      </>
    );
  }

}

const styles = StyleSheet.create({
  listEmptyWrap: {alignItems: 'center', justifyContent: 'center', flex: 1},
  listEmptyText: {fontSize: 18, fontWeight: '400', color: colors.color333, lineHeight: 25, padding: 10},
  listEmptyIcon: {fontSize: 52, color: colors.colorDDD, padding: 10},
  extraViewWrap: {backgroundColor: colors.white},
  header: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center'},
  selectWrap: {justifyContent: 'center', alignItems: 'center', paddingTop: 8, paddingBottom: 8},
  selectText: {
    color: colors.color333,
    textAlign: 'center',
    width: '100%',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20
  },
  row: {flexDirection: 'row'},
  renderSelectItemWrap: {flexDirection: 'row', backgroundColor: colors.white, paddingTop: 12},
  selectedItem: {width: '50%', paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#59B26A'},
  notSelectItem: {width: '50%', paddingBottom: 4,},
  selectedItemText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#59B26A',
    lineHeight: 22
  },
  notSelectedItemText: {color:colors.color333,textAlign: 'center', fontSize: 16, fontWeight: '600', lineHeight: 22},
  itemWrap: {paddingTop: 10, paddingLeft: 10, paddingRight: 10},
  itemMasterWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 74,
    borderRadius: 8
  },
  flag: {fontSize: 16, fontWeight: '600', color: colors.color333, paddingLeft: 4},
  dayId: {fontSize: 24, fontWeight: '600', color: colors.color333, lineHeight: 33},
  stallName: {fontSize: 14, fontWeight: '400', color: colors.color333, lineHeight: 20, width: 80},
  platformIcon: {width: 36, height: 36, borderRadius: 18,},
  alreadyStock: {fontSize: 14, fontWeight: '400', color: '#E21B1B', lineHeight: 20},
  prepareStock: {fontSize: 14, fontWeight: '400', color: colors.color999, lineHeight: 20},
  totalNum: {fontSize: 12, fontWeight: '600', color: '#FF8854', lineHeight: 16, marginBottom: 16},
  itemToggle: {fontSize: 14, fontWeight: '400', color: colors.color333, lineHeight: 20},
  itemTitle: {fontSize: 12, fontWeight: '400', color: colors.color333, lineHeight: 17,},
  remarkWrap: {
    flexDirection: 'row',
    borderBottomColor: colors.colorEEE,
    borderBottomWidth: 1,
    padding: 12,
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  remark: {fontSize: 12, fontWeight: '400', color: '#F76969', lineHeight: 17, marginLeft: 13, width: '80%'},
  padding12: {padding: 12},
  itemDetailTitle: {fontSize: 13, fontWeight: '600', color: colors.color333, lineHeight: 18},
  itemDetailPrice: {fontSize: 12, fontWeight: '400', color: '#E12020', lineHeight: 17},
  itemDetailNumNormal: {fontSize: 12, fontWeight: '600', color: colors.color333, lineHeight: 17},
  itemDetailNumMany: {fontSize: 12, fontWeight: '600', color: '#E12020', lineHeight: 17},
  stallSuccessText: {fontSize: 16, fontWeight: '400', color: colors.color999, lineHeight: 22, textAlign: 'center'},
  stallSuccessBtn: {borderRadius: 2, backgroundColor: colors.main_color},
  stallSuccessBtnText: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.white,
    lineHeight: 22,
    textAlign: 'center',
    padding: 8
  },
  itemDetailRow: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between'
  }
})

export default connect(mapStateToProps)(StockingTasks)
