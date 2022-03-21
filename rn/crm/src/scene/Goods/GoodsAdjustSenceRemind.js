import React, {PureComponent} from 'react'
import {connect} from "react-redux";
import FetchEx from "../../util/fetchEx";
import AppConfig from "../../config";
import styles from "./GoodsAdjustStyles";
import LoadMore from 'react-native-loadmore'
import {Image, Text, TextInput, TouchableWithoutFeedback, View} from "react-native";
import EmptyListView from "../Invoicing/EmptyListView";
import Dialog from "./Dialog";
import Constat from "../../Constat";
import {ToastShort} from "../../util/ToastUtils";
import {withNavigation} from '@react-navigation/compat';
import {newProductSave, uploadImg} from "../../reducers/product/productActions";
import * as globalActions from "../../reducers/global/globalActions";
import {bindActionCreators} from "redux";

function mapStateToProps(state) {
  const {invoicing, global, batch} = state;
  return {invoicing, global, batch}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        uploadImg,
        newProductSave,
        ...globalActions
      },
      dispatch
    )
  };
}

class GoodsAdjustRemind extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      checkedStoreId: 0,
      dataSource: [],
      pageNum: 1,
      pageSize: 5,
      isLastPage: false,
      modifyPriceModalVisible: false,
      selectItem: {
        product: {
          price: 0
        }
      },
      price: '',
      batch: this.props.batch
    }
  }

  UNSAFE_componentWillMount() {
    this.fetchData()
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
  }

  renderItems() {
    const {dataSource} = this.state;
    let items = [];
    const batch = this.props.batch == 1
    for (let i in dataSource) {
      items.push(
        <TouchableWithoutFeedback
          key={i}
          delayLongPress={500}
          onLongPress={() => this.props.navigation.setParams({batch: 1})}
        >
          <View style={styles.listItem}>
            <View style={styles.listItemTop}>
              {/*批量操作按钮*/}
              {
                batch ?
                  <TouchableWithoutFeedback onPress={() => this.handleSelectItem(i, dataSource[i], dataSource)}>
                    {
                      dataSource[i].batch ?
                        <Image style={styles.listItemBatchImage} source={require('../../img/Goods/xuanzhong_.png')}/>
                        :
                        <Image style={styles.listItemBatchImage} source={require('../../img/Goods/weixuanzhong_.png')}/>
                    }
                  </TouchableWithoutFeedback>
                  : null
              }
              <Image style={styles.listItemImage} source={{uri: (dataSource[i].image)}}/>
              <View style={{flex: 1}}>
                <Text style={styles.listItemGoodsName}>{dataSource[i].product_name} </Text>
              </View>
            </View>
            <Text style={styles.listItemRemark}>
              <Text style={styles.listItemRemarkTag}>#{dataSource[i].operation_name}提醒#</Text>
              <Text style={styles.listItemRemarkDetail}>理由：{dataSource[i].remark} </Text>
            </Text>
            {dataSource[i].price && dataSource[i].price !== '0.00' ? <Text style={styles.listItemPrice}>
              建议价格：¥{dataSource[i].price}
            </Text> : null}
            {/*有处理时间则不显示操作按钮*/}
            {dataSource[i].handle_time ?
              <View style={styles.listItemOperation}>
                <View/>
                <Text>处理结果：{dataSource[i].handle_name} </Text>
              </View> : <View style={styles.listItemOperation}>
                {
                  dataSource[i].operation_type === '4' || dataSource[i].operation_type === '2' ?
                    <Text
                      style={styles.operationTime}>{dataSource[i].limit_time}自动{dataSource[i].operation_name} </Text> :
                    <View/>
                }
                <View style={{flexDirection: 'row'}}>
                  <TouchableWithoutFeedback onPress={() => this.handleReject(dataSource[i].id)}>
                    <View>
                      <Text style={[styles.listItemOperationBtn, styles.operationBtnDark]}>拒绝</Text>
                    </View>
                  </TouchableWithoutFeedback>
                  <TouchableWithoutFeedback onPress={() => this.handlePass(dataSource[i].id)}>
                    <View>
                      <Text style={[styles.listItemOperationBtn, styles.operationBtnLight]}>同意</Text>
                    </View>
                  </TouchableWithoutFeedback>
                  {/*涨价 降价可以自调价格*/}
                  {dataSource[i].operation_type === '1' || dataSource[i].operation_type === '2' ?
                    <TouchableWithoutFeedback onPress={() => {
                      this.setState({
                        modifyPriceModalVisible: true,
                        selectItem: dataSource[i],
                        price: dataSource[i].price
                      })
                    }}>
                      <View>
                        <Text style={[styles.listItemOperationBtn, styles.operationBtnLight]}>自调价格</Text>
                      </View>
                    </TouchableWithoutFeedback>
                    : null}
                </View>
              </View>}
          </View>
        </TouchableWithoutFeedback>
      )
    }

    return items.length > 0 ? items : <EmptyListView/>
  }

  renderModifyPriceModal() {
    return (
      <Dialog
        visible={this.state.modifyPriceModalVisible}
        buttons={[{
          label: '取消',
          type: 'default',
          onPress: () => {
            this.setState({modifyPriceModalVisible: false})
          }
        }, {
          label: '保存',
          type: 'primary',
          onPress: () => {
            this.handleModify()
          }
        }]}
        title={'修改价格'}
        titleStyle={{textAlign: 'center'}}
        onRequestClose={() => {
        }}
      >
        <View>
          <Text style={styles.dialogTopText}>优势品不高于线下的价格的9折，采购他人的加价不超过10%</Text>
          <Text style={styles.dialogBottomText}>输入价格/元（当前价格为{this.state.selectItem.product_price}）</Text>
          <TextInput
            style={styles.dialogInput}
            underlineColorAndroid="transparent"
            value={this.state.price}
            onChangeText={(price) => this.setState({price})}
            keyboardType={'numeric'}
          />
        </View>
      </Dialog>
    )
  }

  render() {
    return (
      <View style={{paddingBottom: 100}}>
        <LoadMore
          loadMoreType={'scroll'}
          renderList={this.renderItems()}
          onLoadMore={() => {
            this.fetchData()
          }}
          onRefresh={() => {
            this.fetchData({pageNum: 1})
          }}
          isLastPage={false}
        />
        {this.renderModifyPriceModal()}
      </View>
    )
  }

  fetchData(options = {}) {
    let self = this;
    const {global} = this.props;
    const {pageNum, pageSize, dataSource, checkedStoreId} = this.state;
    let token = global['accessToken'];
    let store_id = checkedStoreId ? checkedStoreId : global['currStoreId'];
    const url = `api/product_adjust_list?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON(url, {
      store_id: store_id,
      page: options.pageNum ? options.pageNum : pageNum,
      page_size: pageSize
    })).then(resp => resp.json()).then(resp => {
      let {ok, obj} = resp;
      if (ok) {
        let next_page = 0;
        let isLastPage = false;
        const data_list = obj.data;
        let data = obj.currPage == 1 ? [] : dataSource;
        if (obj.currPage !== obj.totalPage) {
          next_page = obj.currPage + 1;
        } else {
          isLastPage = true
        }
        if (data_list.length > 0) {
          data_list.forEach(item => {
            data.push(item)
          })
        }
        self.setState({pageNum: next_page, dataSource: data, isLastPage})
      }
    })
  }

  handleBase(adjust_id, handle_result, price = 0) {
    let self = this;
    const {global} = this.props;
    let token = global['accessToken'];
    const url = `api/adjust_product?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON(url, {
      adjust_id: adjust_id,
      result: handle_result,
      price: price
    })).then(resp => resp.json()).then(resp => {
      let {ok, reason} = resp;
      if (ok) {
        ToastShort('操作成功');
        self.setState({modifyPriceModalVisible: false});
        self.fetchData()
      } else {
        ToastShort(reason)
      }
    })
  }

  handleReject(adjust_id) {
    this.handleBase(adjust_id, Constat.GOOD_ADJUST.OPERATION_REJECT)
  }

  handlePass(adjust_id) {
    this.handleBase(adjust_id, Constat.GOOD_ADJUST.OPERATION_AGREE)
  }

  handleModify() {
    this.handleBase(this.state.selectItem.id, Constat.GOOD_ADJUST.OPERATION_MODIFY, this.state.price)
  }

  handleSelectItem(i, data, dataSource) {
    data.batch = !data.batch;
    dataSource = dataSource.splice(i, 1, data);
    this.setState({dataSource})
  }
}

const component = withNavigation(GoodsAdjustRemind);
export default connect(mapStateToProps, mapDispatchToProps)(component)
