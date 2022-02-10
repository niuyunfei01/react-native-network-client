import React, {Component} from "react";
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import pxToDp from "../../util/pxToDp";
import Rate from "../../Components/Goods/Rate";
import GoodsListItem from "../../Components/Goods/GoodsListItem";


function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

class GoodsList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      store_id: this.props.global.currStoreId,
      access_token: this.props.global.accessToken,
    }
  }

  static navigationOptions = ({navigation}) => {
    return {
      headerLeft: null,
      headerRight: (
        <View style={styles.header_right}>
          <TouchableOpacity>
            <View>
              <Text style={styles.header_btn}>上新</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity>
            <View>
              <Text style={styles.header_btn}>2.23分</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity>
            <View>
              <Text style={styles.header_btn}>搜索</Text>
            </View>
          </TouchableOpacity>
        </View>
      ),
    }
  }

  componentDidMount() {
  }

  render_adjust() {
    const h = (
      <View style={styles.notice_item}>
        <View style={{flexDirection: 'row'}}>
          <Image source={require('../../img/Goods/tixing_.png')} style={styles.notice_image}/>
          <Text style={styles.notice_text}>有32条商品价格变动申请待处理</Text>
        </View>
        <TouchableOpacity>
          <View>
            <Text style={styles.notice_link}>去处理></Text>
          </View>
        </TouchableOpacity>
      </View>
    )
    return h
  }

  render_compete() {
    const h = (
      <View style={styles.notice_item}>
        <View style={{flexDirection: 'row'}}>
          <Image source={require('../../img/Goods/tixing_.png')} style={styles.notice_image}/>
          <Text style={styles.notice_text}>价格竞争力较低</Text>
          <Rate currRecord={2.32} style={{marginLeft: pxToDp(20)}}/>
        </View>
        <TouchableOpacity>
          <View>
            <Text style={styles.notice_link}>提升竞争力></Text>
          </View>
        </TouchableOpacity>
      </View>
    )
    return h
  }

  render_category() {
    return (
      <View style={styles.category_box}>
        <ScrollView>
          <For each="item" index="idx" of={[1, 2, 3, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]}>
            <TouchableOpacity key={idx}>
              <View style={styles.category_item}>
                <Text style={styles.category}>特价抢鲜</Text>
              </View>
            </TouchableOpacity>
          </For>
        </ScrollView>
      </View>
    )
  }

  render_goods() {
    return (
      <View style={styles.goods_box}>
        <ScrollView>
          <For each="item" index="idx" of={[1, 2, 3, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]}>
            <GoodsListItem
              key={idx}
              image={'http://www.cainiaoshicai.cn/files/201709/thumb_m/fceebab66ca_0905.jpg'}
              name={'北京稻香村玫瑰细沙月饼110g/个'}
              wmPrice={16.50}
              style={{marginBottom: pxToDp(10)}}
            />
          </For>
        </ScrollView>
      </View>
    )
  }

  render() {
    return (
      <View style={{flex: 1}}>
        {this.render_adjust()}
        {this.render_compete()}
        <View style={{flexDirection: 'row', flex: 1}}>
          {this.render_category()}
          {this.render_goods()}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  header_right: {
    flexDirection: 'row'
  },
  header_btn: {
    width: pxToDp(90),
    height: pxToDp(45),
    borderRadius: pxToDp(22.5),
    fontSize: pxToDp(24),
    textAlign: 'center',
    lineHeight: pxToDp(40),
    backgroundColor: '#59b26a',
    color: '#fefffe',
    marginRight: pxToDp(30)
  },
  notice_item: {
    paddingHorizontal: pxToDp(30),
    height: pxToDp(90),
    backgroundColor: '#fff43a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: pxToDp(1),
    borderStyle: 'solid',
    borderColor: '#eee'
  },
  notice_image: {
    width: pxToDp(44),
    height: pxToDp(38)
  },
  notice_text: {
    fontSize: pxToDp(30),
    color: '#fd5b1b'
  },
  notice_link: {
    fontSize: pxToDp(30),
    color: '#59b26a'
  },
  category_box: {
    width: pxToDp(164)
  },
  category_item: {
    borderWidth: pxToDp(0.5),
    borderColor: '#dfdfdf',
    borderStyle: 'solid',
    flexDirection: 'column',
    backgroundColor: '#eeeeee',
    height: pxToDp(90),
    width: pxToDp(164),
    justifyContent: 'center',
    alignItems: 'center'
  },
  category: {
    color: '#4c4c4c',
    fontSize: pxToDp(24),
  },
  goods_box: {
    flex: 1
  }
})

export default connect(mapStateToProps)(GoodsList)
