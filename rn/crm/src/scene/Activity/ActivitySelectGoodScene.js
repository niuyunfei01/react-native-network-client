import Autocomplete from 'react-native-autocomplete-input';
import React, {Component} from 'react';
import tool from '../../common/tool'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  RefreshControl,
  BackHandler,
} from 'react-native';

import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
} from "../../weui/index";
import common from './commonStyle';
import pxToDp from "../../util/pxToDp";
import {fetchStoresProdList} from '../../reducers/activity/activityAction'
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {Toast} from "../../weui/index";
import colors from "../../styles/colors";
import {ToastLong} from "../../util/ToastUtils";
import ActivityDialog from './ActivityDialog'
import BottomBtn from './ActivityBottomBtn'
import {NavigationItem} from '../../widget';
import ActivityAlert from './ActivityAlert'


function mapStateToProps(state) {
  return {
    global: state.global,
    product: state.product,
    activity: state.activity,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchStoresProdList
    }, dispatch)
  }
}

class ProductAutocomplete extends Component {
  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: '选择商品',
      headerLeft: () => (
          <NavigationItem
              icon={require('../../img/Register/back_.png')}
              iconStyle={{width: pxToDp(48), height: pxToDp(48), marginLeft: pxToDp(31), marginTop: pxToDp(20)}}
              onPress={() => {
                this.confimBack()
              }}
          />
      ),
    })
  }
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      pid: 0,
      itemNumber: 0,
      numOfPid: [],
      prodInfos: {},
      loadingInfoError: '',
      hideResults: false,
      rendertList: [],
      selectList: [],
      showDialog: false,
      selectListId: [],
      vendorId: 0,
      store_ids: [],
      loading: true,
      confimBack: false,
      beforeList:[]
    };
  }

  async UNSAFE_componentWillMount() {
    let {stores, goodsList} = this.props.activity
    let {vendorId, store_ids, product_id} = this.props.route.params;
    await this.setState({
      selectListId: tool.deepClone(product_id),
      vendorId: vendorId,
      store_ids: store_ids,
      beforeList:tool.deepClone(product_id),
    });
    if (JSON.stringify(stores.sort()) == JSON.stringify(store_ids.sort())) {
      this.setState({
        prodInfos: goodsList,
        loading: false,
      })
    } else {
      this.getStoresProdList();
    }
    BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
  }

  confimBack = ()=>{
    console.log(this.identical());
    this.identical()?this.props.navigation.goBack():this.setState({confimBack:true})
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
  }

  onBackAndroid = () => {
    !this.identical() ? ToastLong('尚未保存数据') : '';
    return !this.identical()
  };
  identical() {
    let {beforeList, selectListId} = this.state;
    console.log(beforeList, selectListId)
    if (beforeList.sort().toString() == selectListId.sort().toString()) {
      return true
    } else {
      return false
    }
  }
  getStoresProdList() {
    let {vendorId, store_ids} = this.state;
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    dispatch(fetchStoresProdList({vendorId, store_ids}, accessToken, (ok, reason, obj) => {
      if (ok) {
        this.setState({prodInfos: obj, loading: false})
      }
    }))
  }

  findFilm(query) {
    if (query === '' || query === '[上架]' || query === '[下架]' || query === '[' || query === ']') {
      return [];
    }
    const {prodInfos} = this.state;
    try {
      query = query.replace(/\[上架\]|\[下架\]|\[上架|\[下架|\[上|\[下/, '');
      const regex = new RegExp(`${query.trim()}`, 'i');
      return Object.keys(prodInfos).map((k) => prodInfos[k]).filter(prod => prod.name.search(regex) >= 0);
    } catch (ex) {
      console.log('ex:', ex);
      return [];
    }
  }

  renderBtn(obj) {
    let {selectListId} = this.state;
    let length = tool.length(selectListId.filter((item) => {
      return item == obj.id
    }));
    if (!length) {
      return (
          <TouchableOpacity
              onPress={() => {
                this.state.selectList.push(obj);
                this.state.selectListId.push(obj.id);
                this.forceUpdate()
              }}
          >
            <Text style={{
              width: pxToDp(130),
              textAlign: 'center',
              color: colors.white,
              backgroundColor: colors.main_color,
              height: pxToDp(60),
              textAlignVertical: 'center',
              borderRadius: pxToDp(5)
            }}>添加</Text>
          </TouchableOpacity>
      )
    } else {
      return (
          <Text style={{
            width: pxToDp(130),
            textAlign: 'center',
            color: colors.white,
            backgroundColor: '#dcdcdc',
            height: pxToDp(60),
            textAlignVertical: 'center',
            borderRadius: pxToDp(5)
          }}>已添加</Text>
      )
    }
  }

  render() {
    const {query, selectListId, prodInfos} = this.state;
    const filteredProds = this.findFilm(query);
    const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();
    return (
        <View style={{flex: 1, position: 'relative',}}>
          <ScrollView style={{flex: 1, position: 'relative', height: '100%'}}
                      refreshControl={
                        <RefreshControl
                            refreshing={this.state.loading}
                            onRefresh={() => {
                              this.setState({loading: true})
                              this.getStoresProdList()
                            }}
                            tintColor='gray'
                        />
                      }
          >
            <Cells style={common.cells}>
              <Cell customStyle={[common.cell, {paddingHorizontal: pxToDp(30)}]}
                    onPress={() => {
                      this.setState({showDialog: true})
                    }}
              >
                <CellHeader>
                  <Text>已选商品</Text>
                </CellHeader>
                <CellFooter>
                  <Text> {tool.length(selectListId)}</Text>
                  <Image
                      style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                      source={require('../../img/Public/xiangxia_.png')}
                  />
                </CellFooter>
              </Cell>
            </Cells>
            <View style={[styles.container, {flex: 1, height: pxToDp(400),}]}>
              <Autocomplete
                  autoCapitalize="none"
                  containerStyle={[styles.autocompleteContainer]}
                  inputContainerStyle={{
                    borderColor: colors.main_color,
                    borderWidth: pxToDp(1),
                    borderRadius: pxToDp(5)
                  }}
                  autoCorrect={false}
                  data={filteredProds.length === 1 && comp(query, filteredProds[0].name) ? [] : filteredProds}
                  defaultValue={query}
                  onChangeText={text => this.setState({query: text, hideResults: false})}
                  hideResults={this.state.hideResults}
                  placeholder="输入商品名模糊查找"
                  renderItem={(obj) => (
                      <TouchableOpacity onPress={() => {
                        this.setState({
                          hideResults: true,
                          rendertList: [obj]
                        })
                      }
                      }>
                        <Text style={[styles.itemText, {zIndex: 101}]}>
                          {obj.name}
                        </Text>
                      </TouchableOpacity>
                  )}
                  underlineColorAndroid={'transparent'}
              />
              {
                this.state.hideResults ? <View style={{marginTop: pxToDp(60), zIndex: 100}}>

                  {
                    this.state.rendertList.map((item, index) => {
                      let {name, id, listimg} = item;
                      return (
                          <Cell key={index} customStyle={{
                            height: pxToDp(150),
                            marginLeft: pxToDp(30),
                            marginHorizontal: pxToDp(30),
                            borderBottomWidth: pxToDp(1),
                            borderBottomColor: colors.fontGray,
                          }}
                                first
                          >
                            <Image source={!!listimg ? {uri: listimg} : require('../../img/Order/zanwutupian_.png')}
                                   style={{height: pxToDp(90), width: pxToDp(90)}}/>
                            <CellBody style={{paddingLeft: pxToDp(10), marginRight: pxToDp(60)}}>
                              <Text numberOfLines={2}>{name}</Text>
                              <Text>#{id}</Text>
                            </CellBody>
                            <CellFooter>
                              {
                                this.renderBtn(item)
                              }
                            </CellFooter>
                          </Cell>
                      )
                    })
                  }
                </View> : null
              }
            </View>
            <ActivityDialog
                showDialog={this.state.showDialog}
                title={'已选商品'}
                buttons={[{
                  type: 'primary',
                  label: '确定',
                  onPress: () => {
                    this.setState({showDialog: false,});
                  }
                }]}
            >
              {
                tool.length(prodInfos) > 0 ? this.state.selectListId.map((item, index) => {
                  let {name, id, listimg} = prodInfos[item];
                  return (
                      <Cell key={index} customStyle={{
                        height: pxToDp(150),
                        marginLeft: pxToDp(30),
                        marginHorizontal: pxToDp(30),
                        borderBottomWidth: pxToDp(1),
                        borderBottomColor: colors.fontGray,
                      }}
                            first
                      >
                        <Image source={!!listimg ? {uri: listimg} : require('../../img/Order/zanwutupian_.png')}
                               style={{height: pxToDp(90), width: pxToDp(90)}}/>
                        <CellBody style={{paddingLeft: pxToDp(10), marginRight: pxToDp(60), flex: 1}}>
                          <Text numberOfLines={2} style={{width: '100%'}}>{name}</Text>
                          <Text>#{id}</Text>
                        </CellBody>
                        <CellFooter>
                          <TouchableOpacity
                              onPress={() => {
                                this.state.selectListId.splice(index, 1);
                                this.forceUpdate();
                              }}
                          >
                            <Text style={{
                              fontSize: pxToDp(30),
                              color: colors.white,
                              height: pxToDp(60),
                              backgroundColor: colors.main_color,
                              width: pxToDp(130),
                              textAlign: 'center',
                              textAlignVertical: 'center',
                              borderRadius: pxToDp(5),
                            }}>移除</Text>
                          </TouchableOpacity>
                        </CellFooter>
                      </Cell>
                  )
                }) : null

              }
            </ActivityDialog>
            <BottomBtn onPress={() => {
              let {goods_data, index, nextSetBeforeGoods} = this.props.route.params;
              let {selectListId} = this.state;
              goods_data[index]['product_id'] = selectListId;
              nextSetBeforeGoods(goods_data);
              this.props.navigation.goBack();

            }}/>
          </ScrollView>
          <ActivityAlert
              showDialog={this.state.confimBack}
              buttons={[
                {
                  type: 'default',
                  label: '确认离开',
                  onPress: () => {
                    this.setState({confimBack: false,});
                    this.props.navigation.goBack()
                  }
                },
                {
                  type: 'primary',
                  label: '继续编辑',
                  onPress: () => {
                    this.setState({confimBack: false,});
                  }
                }
              ]}
          >
            <Text style={{marginTop: pxToDp(60), paddingHorizontal: pxToDp(30)}}>离开后,操作的内容不会被保存,确认要离开吗?</Text>
          </ActivityAlert>
          <Toast
              icon="loading"
              show={this.state.loading}
              onRequestClose={() => {
              }}
          >加载中</Toast>
        </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 25,
    flex: 1,
  },
  autocompleteContainer: {
    left: 0,
    position: 'absolute',
    right: pxToDp(30),
    top: 0,
    paddingLeft: pxToDp(30),
    paddingTop: pxToDp(20),
    zIndex: 1,
    maxHeight: '90%',
    borderColor: colors.main_color,
  },
  moneyLabel: {fontSize: pxToDp(30), fontWeight: 'bold'},
  moneyText: {fontSize: pxToDp(40), color: colors.color999},
  itemText: {
    fontSize: 15,
    margin: 2
  },
  infoText: {
    textAlign: 'center'
  },
  titleText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'center'
  },
  directorText: {
    color: 'grey',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center'
  },
  openingText: {
    textAlign: 'center'
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ProductAutocomplete)
