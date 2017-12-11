import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  Image,
  FlatList,

} from 'react-native';

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {productSave, fetchVendorProduct, batchPriceSave} from "../../reducers/product/productActions";
import pxToDp from "../../util/pxToDp";
import {NavigationItem} from '../../widget';
import colors from '../../widget/color'

function mapStateToProps(state) {
  const {product, global} = state;
  return {product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators({
      fetchVendorProduct,
      batchPriceSave,
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
      tab:1
    }
    this.tab = this.tab.bind(this)
  }
tab(num){
  this.setState({tab:num})
}
renderList(){
  let arr = []
  for(let i = 0; i <20; i++) {
    
    arr.push({imgUrl:'',name:'葫芦娃',time:'12121212',original_price:'1.5',price:i})
    
  }
 return(

  <FlatList
  style = {{flex:1}}
  data={arr}
  renderItem={({item,key}) =>{
    return(
      <View style={styles.item} key={key}>
      <View style={[styles.center, styles.image]}>
      <Image
        style = {{height:pxToDp(90),width:pxToDp(90)}}
        source={{ uri: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1512925340158&di=45ab61d35ff5c64da5dcdd6511cda77a&imgtype=0&src=http%3A%2F%2Fwww.muslimwww.com%2Fuploadfile%2F2016%2F0212%2F20160212074102495.jpg' }}
      />
      
      </View>

      <View style={[styles.goods_name]}>
        <View style = {styles.name_text}>
          <Text>{item.name}</Text>
        </View>
          <View>
            <Text style={styles.name_time}>{item.time}</Text>
          </View>
      </View>

      <View style={[styles.center, styles.original_price]}>
        <Text style={styles.price_text}>{item.original_price}</Text>
      </View>

      <View style={[styles.center, styles.price]}>

        <Text style={styles.price_text}>{item.price}</Text>

      </View>

    </View>
    )
  }}
  refreshing = {true}
  onEndReachedThreshold={0.8}
  onEndReached = {()=>{
    console.log('加载数据')
  }}
  
/>  
) 
}

  render() {
    return (
        <View style={{flex: 1}}>
          <View style={styles.tab}>
            <TouchableOpacity
            onPress={() =>{
              this.tab(1)
            }}
            >
              <View>
                <Text style = { this.state.tab == 1 ? styles.active :styles.fontStyle }>审核中</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() =>{
                  this.tab(2)
                }}
            >
              <View>
                <Text style = { this.state.tab == 2 ? styles.active :styles.fontStyle }>已完成</Text>
              </View>
            </TouchableOpacity>


            <TouchableOpacity
                onPress={() =>{
                  this.tab(3)
                }}
            >
              <View>
                <Text style = { this.state.tab == 3 ? styles.active :styles.fontStyle }>未完成</Text>
              </View>
            </TouchableOpacity>


          </View>
          <View style={styles.title}>

            <Text style={[styles.title_text]}>图片</Text>
            <Text style={[styles.title_text, {width: pxToDp(240)}]}>商品名称</Text>
            <Text style={[styles.title_text, {width: pxToDp(120)}]}>原价</Text>
            <Text style={[styles.title_text, {width: pxToDp(120)}]}>调整价</Text>

          </View>
          {/* <ScrollView>
            <View style={styles.item}>
              <View style={[styles.center, styles.image]}>
              <Image
                style = {{height:pxToDp(90),width:pxToDp(90)}}
                source={{ uri: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1512925340158&di=45ab61d35ff5c64da5dcdd6511cda77a&imgtype=0&src=http%3A%2F%2Fwww.muslimwww.com%2Fuploadfile%2F2016%2F0212%2F20160212074102495.jpg' }}
              />
              
              </View>

              <View style={[styles.goods_name]}>
                <View style = {styles.name_text}>
                  <Text>nahdshjme</Text>
                </View>
                  <View>
                    <Text style={styles.name_time}>12121212</Text>
                  </View>
              </View>

              <View style={[styles.center, styles.original_price]}>
                <Text style={styles.price_text}>1.25</Text>
              </View>

              <View style={[styles.center, styles.price]}>

                <Text style={styles.price_text}>1.75</Text>

              </View>

            </View>

          </ScrollView> */}

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
    marginTop:pxToDp(20)
  },
  active:{
    color:colors.fontActiveColor,
    fontSize:pxToDp(28),
    marginTop:pxToDp(20),
    borderBottomWidth:pxToDp(3),
    borderBottomColor:colors.fontActiveColor,
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
    backgroundColor:'#fff',
    alignItems:'center'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    height: pxToDp(100),
    
  },
  image: {
    width: pxToDp(90),
    height:'100%',
    flexDirection:'row',
    alignItems:'center'
    
  },
  goods_name: {
    width: pxToDp(240),
    height:pxToDp(100),
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
  name_text:{
    width:'100%',
    minHeight:pxToDp(70)

  },
  name_time: {
    fontSize: pxToDp(18),
    color: colors.fontColor,

  }


})
export default connect(mapStateToProps, mapDispatchToProps)(GoodsApplyRecordScene);