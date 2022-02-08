import React, {Component} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {List, Radio, SearchBar} from "@ant-design/react-native";
import Cts from "../../Cts";
import tool from "../../common/tool";

import AppConfig from "../../config";
import Config from "../../config";
import config from "../../config";


import {showError, ToastLong} from "../../util/ToastUtils";
import LoadMore from "react-native-loadmore";
import {WebView} from "react-native-webview";
import ShopInMap from "./ShopInMap";
import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellHeader} from "../../weui";
import MIcon from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../../styles/colors";
import {NavigationItem} from "../../widget";


const RadioItem = Radio.RadioItem;


class SearchShop extends Component {
  constructor(props) {
    super(props);
    const {limit_store, onBack, isType} = this.props.route.params;

    this.state = {
      fnPriceControlled: false,
      shops: [],
      page_size: 1,
      page_num: Cts.GOODS_SEARCH_PAGE_NUM,
      isLoading: false,
      isLastPage: false,
      selectTagId: 0,
      selIndex: 0, // 选中索引
      searchKeywords: this.props.route.params.keywords,
      showNone: false,
      isMap: false, //控制显示搜索还是展示地图
      isCan: true,
      onBack,
      coordinate: "116.40,39.90",//默认为北京市
      isType,
      cityname: "北京市",
      shopmsg: "123",
      weburl: AppConfig.apiUrl('/map.html')
    }
    if (this.props.route.params.keywords) {
      this.search()
    }
  }

  navigationOptions2 = ({navigation}) => {
    navigation.setOptions({
      headerTitle: '门店搜索',
      headerLeft: () => (
        <NavigationItem
          icon={require('../../img/Register/back_.png')}
          position={'left'}
          iconStyle={{
            width: pxToDp(48),
            height: pxToDp(48),
          }}
          onPress={() => {
            navigation.goBack()
          }}
        />),
      headerRight: () => {
      },
    })

  }


  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: '',
      headerLeft: () => {
        return (
          <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => {
            this.setState({
              isMap: false
            })
            this.navigationOptions2(this.props)
          }}>
            <Text style={{
              paddingHorizontal: 9,
              color: '#2b2b2b',
              fontWeight: 'bold',
            }}>重新选择</Text>

          </TouchableOpacity>
        )
      },
      headerRight: () => {
        return (
          <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => {
            //用户确定    返回上一层页面
            this.setState({
              isShow: false
            })
            this.props.route.params.onBack(this.state.shopmsg);

            if (this.props.route.params.isType == "fixed") {
              this.props.navigation.navigate(config.ROUTE_STORE_ADD, this.state.shopmsg);
            } else if (this.props.route.params.isType == "orderSetting") {
              this.props.navigation.navigate(config.ROUTE_ORDER_SETTING, this.state.shopmsg);
            } else if(this.props.route.params.isType == "OrderEdit"){
               this.props.navigation.navigate(config.ROUTE_ORDER_EDIT, this.state.shopmsg);
            }else {
              this.props.navigation.navigate('Apply', this.state.shopmsg);
            }

          }}>
            <Text style={{
              paddingHorizontal: 9,
              color: '#2b2b2b',
              fontWeight: 'bold',
            }}>确定</Text>

          </TouchableOpacity>
        )
      },

    })
  }


  onCancel = () => { //点击取消

    this.setState({searchKeywords: '', shops: []});
  }
  search = (showLoading = false) => {   //submit 事件 (点击键盘的 enter)
    tool.debounces(() => {
      const searchKeywords = this.state.searchKeywords ? this.state.searchKeywords : '';
      if (searchKeywords) {
        let header = 'https://restapi.amap.com/v5/place/text?parameters?'
        const params = {
          keywords: searchKeywords,
          key: '85e66c49898d2118cc7805f484243909',
          location: this.state.coordinate,
          radius: "50000"
          //key:'608d75903d29ad471362f8c58c550daf',
          // page_size: this.state.page,
          // page_num: this.state.page_num,
        }
        Object.keys(params).forEach(key => {
            header += '&' + key + '=' + params[key]
          }
        )

        //根据ip获取的当前城市的坐标后作为location参数以及radius 设置为最大

        fetch(header)
          .then(response => response.json())
          .then(data => {

            if (data.status == 1) {
              this.setState({
                shops: data.pois,
                isLoading: false,
                showLoading: false,
              })

            } else {
            }
          });

      } else {
        showError("请输入内容")
      }
    }, 1000)
  }

  onChange = (searchKeywords: any) => {
    const toUpdate = {searchKeywords};
    if (this.state.searchKeywords !== searchKeywords) {
      toUpdate.page = 1
    }
    this.setState(toUpdate, () => {
      this.search(true)
    });
  }


  renderSearchBar = () => {
    return <Cell first>

      <CellHeader>

        <TouchableOpacity
          onPress={() =>
            this.props.navigation.navigate(
              Config.ROUTE_SELECT_CITY_LIST,
              {
                callback: selectCity => {
                  const message: string = selectCity.name;
                  this.webview.postMessage(message)
                }
              }
            )
          }
        >
          <Text>
            <MIcon name="map-marker-outline" style={styles.map_icon}/>
            {this.state.cityname}

          </Text>
        </TouchableOpacity>
      </CellHeader>

      <CellBody>
        <SearchBar placeholder="请输入您的店铺地址" value={this.state.searchKeywords} onChange={this.onChange}
                   onCancel={this.onCancel} onSubmit={() => this.search(true)} returnKeyType={'search'}/>
      </CellBody>
    </Cell>


  }


  onRefresh() {
    return

  }

  onLoadMore() {
    return

  }


  renderList() {
    const shops = this.state.shops
    let items = [];
    let obj = {};
    let that = this;
    for (const i in shops) {
      const shopItem = that.state.shops[i];
      items.push(
        <RadioItem key={i}
                   style={{fontSize: 16, fontWeight: 'bold', paddingTop: pxToDp(15), paddingBottom: pxToDp(15)}}
                   checked={that.state.selIndex === i}
                   onChange={event => {
                     if (event.target.checked) {
                       that.state.shops[i].onBack = this.state.onBack;
                       this.setState({
                         isMap: true,
                         shopmsg: that.state.shops[i]
                       })
                       this.navigationOptions(this.props)

                     }
                   }}>
          <View>
            <Text>{shopItem.name}</Text>
            <Text
              style={{
                color: "gray",
                fontSize: 12
              }}>{shopItem.pname}{shopItem.cityname}{shopItem.adname}{shopItem.address}</Text>
          </View>


        </RadioItem>
      )
    }
    return <List style={{marginTop: 12}}>
      {items}
    </List>
  }


  render() {
    return (
      this.state.isMap ? (<ShopInMap name={this.state.shopmsg}/>) : (<View style={{
        flex: 1,
        paddingBottom: pxToDp(100),
        backgroundColor: colors.colorEEE
      }}>

        <View style={{
          flexGrow: 1,
        }}>
          {this.renderSearchBar()}
          <View style={{
            flexDirection: "column",
            paddingBottom: 80
          }}>
            {this.state.shops && this.state.shops.length ? (
              <View>
                <LoadMore
                  loadMoreType={'scroll'}
                  renderList={this.renderList()}
                  onRefresh={() => this.onRefresh()}
                  onLoadMore={() => this.onLoadMore()}
                  isLastPage={this.state.isLastPage}
                  isLoading={this.state.isLoading}
                  scrollViewStyle={{
                    paddingBottom: 5,
                    marginBottom: 0
                  }}
                  indicatorText={'加载中'}
                  bottomLoadDistance={10}
                />
                <View style={{
                  paddingVertical: 9,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  flex: 1
                }}>
                  {this.state.isLastPage}
                </View>
              </View>
            ) : (<View style={{
              paddingVertical: 9,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              marginTop: '40%',
              flex: 1
            }}>
              <If condition={this.state.keywords && this.state.shops.length == 0}>
                <Text>没有找到" {this.state.searchKeywords} "这个店铺</Text>
              </If>
            </View>)}


          </View>
          {/*<ScrollView/>*/}


          <WebView

            ref={w => this.webview = w}
            // source={require('./map.html')}


            source={{uri: this.state.weburl}}
            onMessage={(event) => {
              let cityData = JSON.parse(event.nativeEvent.data)

              if (cityData.info) {
                if (cityData.restype === 'auto') {
                  if (this.props.route.params.isType == "orderSetting"){
                  //  创建订单的时候 取门店所在城市
                    this.state.coordinate = this.props.route.params.loc_lng+","+this.props.route.params.loc_lat;
                    this.setState({
                      cityname: this.props.route.params.cityname
                    })
                  }else{
                    // ToastLong('已自动定位到' + cityData.city)
                    let coordinate = cityData.rectangle.split(';')[0];
                    if (coordinate) {
                      this.state.coordinate = coordinate;
                      this.setState({
                        cityname: cityData.city
                      })

                    }
                  }


                } else {

                  if (cityData.geocodes && cityData.geocodes[0]) {
                    let resu = cityData.geocodes[0];
                    ToastLong('已定位到' + resu.formattedAddress)
                    let rescoordinate = resu.location.lng + ',' + resu.location.lat;
                    this.setState({
                      cityname: resu.addressComponent.city
                    })

                    this.state.coordinate = rescoordinate;
                  }


                }
              }


            }}
            style={{display: 'none', backgroundColor: colors.colorEEE}}
          />
        </View>
        <View style={{flex: 1, backgroundColor: colors.colorEEE}}></View>
        <Text></Text>
      </View>)


    )
      ;
  }
}

const
  styles = StyleSheet.create({

    map_icon: {
      fontSize: pxToDp(30),
      color: colors.color666,
      height: pxToDp(60),
      width: pxToDp(40),
      textAlignVertical: "center"
    },
  })

export default SearchShop;
