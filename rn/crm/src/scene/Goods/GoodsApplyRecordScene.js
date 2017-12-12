import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {productSave, batchPriceSave,fetchApplyRocordList} from "../../reducers/product/productActions";
import pxToDp from "../../util/pxToDp";
import {NavigationItem} from '../../widget';
import colors from '../../widget/color'
import Cts from "../../Cts";
import {Toast} from "../../weui/index";
import LoadingView from "../../widget/LoadingView";
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
            navigation.goBack();
          }}
      />),
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      audit_status: Cts.AUDIT_STATUS_WAIT,
      page :1,
      list:[],
      query:true,
      pullLoading:false

    }
    this.tab = this.tab.bind(this);
  }

 async tab(num) {
    if(num != this.state.audit_status){
      await this.setState({query:true,page:1,audit_status: num,list:[]});
      this.getApplyList()
    }

  }
  componentWillMount(){

  }
  getApplyList(){
    let store_id = this.props.global.currStoreId;
    let audit_status = this.state.audit_status;
    let page = this.state.page;
    let token = this.props.global.accessToken;
    const {dispatch} = this.props;
    dispatch(fetchApplyRocordList(store_id, audit_status, page, token,(resp) => {
      if (resp.ok) {
        console.log(resp)
        for (let i = 0; i < page*20; i++) {
          this.state.list.push({
            "key":i,
            "id": "3",
            "vendor_id": "2",
            "store_id": "10",
            "product_id": "1147",
            "apply_user": "822472",
            "before_price": "900",
            "apply_price": "970",
            "remark": "涨价了",
            "audit_status": "0",
            "audit_user": "0",
            "audit_desc": "",
            "created": "2017-12-11 17:34:31",
            "updated": "2017-12-11 17:34:31",
            "mt_price": "0",
            "ele_price": "1183",
            "bd_price": "1141",
            "jd_price": "1169",
            "product_name": "农场直供生态快菜300克",
            "apply_name": "张昊博",
            "audit_name": ""
          })
          this.state.query = false;
          this.setState({query:false,pullLoading:false})
        }
        this.forceUpdate()
      } else {
        console.log(resp.desc)
      }
    }));

  }

  renderList() {
    this.state.list.forEach((item ,index)=>{
      item.key = index
    })

    return (
        <FlatList
            style={{flex: 1}}
            data={this.state.list}
            renderItem={({item, key}) => {
              return (
                  <View style={styles.item} key={key}>
                    <View style={[styles.center, styles.image]}>
                      <Image
                          style={{height: pxToDp(90), width: pxToDp(90)}}
                          source={{uri: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1512925340158&di=45ab61d35ff5c64da5dcdd6511cda77a&imgtype=0&src=http%3A%2F%2Fwww.muslimwww.com%2Fuploadfile%2F2016%2F0212%2F20160212074102495.jpg'}}
                      />
                    </View>
                    <View style={[styles.goods_name]}>
                      <View style={styles.name_text}>
                        <Text>{item.product_name}</Text>
                      </View>
                      <View>
                        <Text style={styles.name_time}>{item.created}</Text>
                      </View>
                    </View>
                    <View style={[styles.center, styles.original_price]}>
                      <Text style={styles.price_text}>{item.before_price/100}</Text>
                    </View>
                    <View style={[styles.center, styles.price]}>
                      <Text style={styles.price_text}>{item.apply_price/100}</Text>
                    </View>
                  </View>
              )
            }}
            refreshing={true}
            onEndReachedThreshold={0.9}
            onEndReached={ () => {

              this.setState({page:this.state.page++,pullLoading:true})
              this.getApplyList()
            }}
            ListFooterComponent = {()=> {
              return(
                  this.state.pullLoading ? <LoadingView/> :<View/>
              )
            }}
            // getItemLayout={(data, index) => ( {length: pxToDp(90), offset: pxToDp(90) * index, index} )}//开始后卡顿


        />
    )
  }

  render(){
    return (
        <View style={{flex: 1}}>
          <View style={styles.tab}>
            <TouchableOpacity
                onPress={() => {
                  this.tab(Cts.AUDIT_STATUS_WAIT)
                }}
            >
              <View>
                <Text style={this.state.audit_status == Cts.AUDIT_STATUS_WAIT ? styles.active : styles.fontStyle}>审核中</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => {
                  this.tab(Cts.AUDIT_STATUS_PASSED)
                }}
            >
              <View>
                <Text style={this.state.audit_status == Cts.AUDIT_STATUS_PASSED ? styles.active : styles.fontStyle}>已完成</Text>
              </View>
            </TouchableOpacity>


            <TouchableOpacity
                onPress={() => {
                  this.tab(Cts.AUDIT_STATUS_FAILED)
                }}
            >
              <View>
                <Text style={this.state.audit_status == Cts.AUDIT_STATUS_FAILED ? styles.active : styles.fontStyle}>未完成</Text>
              </View>
            </TouchableOpacity>


          </View>
          <View style={styles.title}>

            <Text style={[styles.title_text]}>图片</Text>
            <Text style={[styles.title_text, {width: pxToDp(240)}]}>商品名称</Text>
            <Text style={[styles.title_text, {width: pxToDp(120)}]}>原价</Text>
            <Text style={[styles.title_text, {width: pxToDp(120)}]}>调整价</Text>

          </View>
          <Toast
              icon="loading"
              show={this.state.query}
              onRequestClose={() => {
              }}
          >加载中</Toast>

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