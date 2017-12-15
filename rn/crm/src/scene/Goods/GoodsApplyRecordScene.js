import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  Modal
} from 'react-native';

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {productSave, batchPriceSave, fetchApplyRocordList} from "../../reducers/product/productActions";
import pxToDp from "../../util/pxToDp";
import {NavigationItem} from '../../widget';
import colors from '../../widget/color'
import Cts from "../../Cts";
import LoadingView from "../../widget/LoadingView";
import native from "../../common/native";
import {ToastLong, ToastShort} from '../../util/ToastUtils';
import {Toast,Dialog,} from "../../weui/index";
import * as tool from "../../common/tool";
function mapStateToProps(state) {
  const {product, global} = state;
  return {product: product, global: global}
}
function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators({
      fetchApplyRocordList,
      ...globalActions
    }, dispatch)
  }
}

class GoodsApplyRecordScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    return {
      headerTitle: '申请记录',
      headerLeft: (<NavigationItem
          icon={require('../../img/Register/back_.png')}
          iconStyle={{width: pxToDp(48), height: pxToDp(48), marginLeft: pxToDp(31), marginTop: pxToDp(20)}}
          onPress={() => {
            native.nativeBack();
          }}
      />),
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      audit_status: Cts.AUDIT_STATUS_WAIT,
      list: [],
      query: true,
      pullLoading: false,
      total_page: 1,
      curr_page: 1,
      refresh: false,
      onSendingConfirm: true,
      dialog:false
    }
    this.tab = this.tab.bind(this);
  }
componentWillMount(){
  this.getApplyList()
}
  async tab(num) {
    if (num != this.state.audit_status) {
      await this.setState({query: true, curr_page: 1, audit_status: num, list: []});
      this.getApplyList()
    }
  }

  tips(msg) {
    this.setState({dialog:true,errMsg:msg})
  }

  ellipsis(str) {
    if (str.length > 16) {
      return `${str.substring(0, 13)}...`
    } else {
      return str
    }
  }

  getApplyList() {
    let store_id = this.props.global.currStoreId;
    let audit_status = this.state.audit_status;
    let page = this.state.curr_page;
    let token = this.props.global.accessToken;
    const {dispatch} = this.props;
    dispatch(fetchApplyRocordList(store_id, audit_status, page, token, async (resp) => {

      if (resp.ok) {
        let {total_page, audit_list} = resp.obj;
        let arrList = []
        if (this.state.refresh) {
          arrList = audit_list
        } else {
          arrList = this.state.list.concat(audit_list)
        }
        await this.setState({
          pullLoading: false,
          list: arrList,
          query: false,
          total_page: total_page,
          refresh: false
        });
      } else {
        console.log(resp.desc)
      }
    }));
  }

  renderTitle() {
    {
      if (this.state.list.length > 0) {
        return (
            <View style={styles.title}>
              <Text style={[styles.title_text]}>图片</Text>
              <Text style={[styles.title_text, {width: pxToDp(240)}]}>商品名称</Text>
              <Text style={[styles.title_text, {width: pxToDp(120)}]}>原价</Text>
              <Text style={[styles.title_text, {width: pxToDp(120)}]}>调整价</Text>
            </View>
        )

      } else {
        return (
            <View/>
        )
      }

    }
  }

  renderList() {
    this.state.list.forEach((item, index) => {
      item.key = index
    });
    return (
        <FlatList
            extraData={this.state}
            style={{flex: 1}}
            data={this.state.list}
            renderItem={({item, key}) => {
              return (
                  <TouchableOpacity
                      onPress={() => {
                        if(item.audit_status == Cts.AUDIT_STATUS_FAILED){
                          this.tips(item.audit_desc)
                        }
                      }}
                  >
                    <View style={styles.item} key={key}>
                      <View style={[styles.center, styles.image]}>
                        <Image
                            style={{height: pxToDp(90), width: pxToDp(90)}}
                            source={{uri: item.cover_img}}
                        />

                      </View>
                      <View style={[styles.goods_name]}>
                        <View style={styles.name_text}>
                          <Text>{`${this.ellipsis(item.product_name)}`}</Text>
                        </View>
                        <View>
                          <Text style={styles.name_time}>
                            #{item.product_id} {tool.orderExpectTime(item.updated)}
                            </Text>
                        </View>
                      </View>
                      <View style={[styles.center, styles.original_price]}>
                        <Text style={styles.price_text}>{item.before_price / 100}</Text>
                      </View>
                      <View style={[styles.center, styles.price]}>
                        <Text style={styles.price_text}>{item.apply_price / 100}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
              )
            }}
            refreshing={true}
            onEndReachedThreshold={0.05}
            onEndReached={async () => {
              let {curr_page, total_page} = this.state;
              console.log('>>>>>>>>>>',this.state.curr_page++);
              if (curr_page < total_page) {
                await this.setState({curr_page: this.state.curr_page++, pullLoading: true})
                this.getApplyList()
              }
            }}
            ListFooterComponent={() => {
              return (
                  this.state.pullLoading ? <LoadingView/> : <View/>
              )
            }}
            ListEmptyComponent={this.renderEmpty()}
            refreshing={false}
            onRefresh={async() => {
             await  this.setState({query: true, refresh: true,curr_page:1});
              this.getApplyList()
            }}

        />
    )
  }

  renderEmpty() {
    if (!this.state.query) {
      return (
          <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: pxToDp(200)}}>
            <Image style={{width: pxToDp(100), height: pxToDp(135)}}
                   source={require('../../img/Goods/zannwujilu.png')}/>
            <Text style={{fontSize: pxToDp(24), color: '#bababa', marginTop: pxToDp(30)}}>没有相关记录</Text>
          </View>
      )
    }
  }

  render() {
    return (
        <View style={{flex: 1}}>
          <View style={styles.tab}>
            <TouchableOpacity
                onPress={() => {
                  this.tab(Cts.AUDIT_STATUS_WAIT)
                }}
            >
              <View>
                <Text
                    style={this.state.audit_status == Cts.AUDIT_STATUS_WAIT ? styles.active : styles.fontStyle}>审核中</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => {
                  this.tab(Cts.AUDIT_STATUS_PASSED)
                }}
            >
              <View>
                <Text
                    style={this.state.audit_status == Cts.AUDIT_STATUS_PASSED ? styles.active : styles.fontStyle}>已审核</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => {
                  this.tab(Cts.AUDIT_STATUS_FAILED)
                }}
            >
              <View>
                <Text
                    style={this.state.audit_status == Cts.AUDIT_STATUS_FAILED ? styles.active : styles.fontStyle}>未通过</Text>
              </View>
            </TouchableOpacity>
          </View>
          {
            this.renderTitle()
          }
          <Toast
              icon="loading"
              show={this.state.query}
              onRequestClose={() => {
              }}
          >加载中</Toast>
          <Dialog onRequestClose={() => {}}
                  visible={this.state.dialog}
                  buttons={[{
                    type: 'warn',
                    label: '',
                    onPress: this.goToSetMap,
                  },
                    {
                      type: 'default',
                      label: '确定',
                      onPress: () => this.setState({dialog: false}),
                    }
                  ]}
          >
            <Text>{this.state.errMsg}</Text>
          </Dialog>
          {
            this.renderList()
          }
        </View>

    )
  }

}


const styles = StyleSheet.create({
  tab: {
    paddingHorizontal: pxToDp(30),
    backgroundColor: '#fff',
    height: pxToDp(90),
    flexDirection: 'row',
    justifyContent: 'space-around',

  },
  fontStyle: {
    fontSize: pxToDp(28),
    marginTop: pxToDp(20)
  },
  active: {
    color: colors.fontActiveColor,
    fontSize: pxToDp(28),
    marginTop: pxToDp(20),
    borderBottomWidth: pxToDp(3),
    borderBottomColor: colors.fontActiveColor,
    paddingBottom: pxToDp(20),
  },
  title: {
    height: pxToDp(55),
    paddingHorizontal: pxToDp(30),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: pxToDp(1),
    borderBottomColor: colors.border,
  },
  title_text: {
    fontSize: pxToDp(24),
    width: pxToDp(90),
    textAlign: 'center'
  },
  item: {
    paddingHorizontal: pxToDp(30),
    height: pxToDp(140),
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: pxToDp(1),
    borderBottomColor: colors.border,
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    height: pxToDp(100),

  },
  image: {
    width: pxToDp(90),
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center'

  },
  goods_name: {
    width: pxToDp(240),
    height: pxToDp(100),
  },
  original_price: {
    width: pxToDp(120)
  },
  price: {
    width: pxToDp(120)
  },
  price_text: {
    color: "#ff0000",
    fontSize: pxToDp(30)
  },
  name_text: {
    width: '100%',
    minHeight: pxToDp(70)

  },
  name_time: {
    fontSize: pxToDp(18),
    color: colors.fontColor,
  }

})
export default connect(mapStateToProps, mapDispatchToProps)(GoodsApplyRecordScene);