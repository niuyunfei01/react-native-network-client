import Autocomplete from 'react-native-autocomplete-input';
import React, {Component} from 'react';
import tool from '../../common/tool'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Image,
} from 'react-native';

import {
  Cells,
  Cell,
  CellHeader,
  CheckboxCells,
  CellBody,
  CellFooter,
  Label,
} from "../../weui/index";
import InputNumber from 'rc-input-number';
import common from './commonStyle';
import pxToDp from "../../util/pxToDp";
import {fetchStoresProdList} from '../../reducers/activity/activityAction'
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {Button, ActionSheet, ButtonArea, Toast, Msg, Dialog, Icon} from "../../weui/index";
import colors from "../../styles/colors";
import {ToastLong} from "../../util/ToastUtils";
import ActivityDialog from './ActivityDialog'
import BottomBtn from './ActivityBottomBtn'
const numeral = require('numeral');

function mapStateToProps(state) {
  return {
    global: state.global,
    product: state.product,
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
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      headerTitle: '选择商品',

    }
  };

  constructor(props) {
    super(props);
    this.state = {
      query: '',
      pid: 0,
      itemNumber: 0,
      numOfPid: [],
      prodInfos: {},
      loadingInfoError: '',
      loadingProds: false,
      hideResults: false,
      rendertList: [],
      selectList:[],
      showDialog: false,
    };
  }

  componentDidMount() {
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    dispatch(fetchStoresProdList({vendor_id: 1, store_ids: ["2", "1"]}, accessToken, (ok, reason, obj) => {
      this.setState({prodInfos: obj})
      console.log(obj);
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
    let{selectList}= this.state;
    let length = tool.length(selectList.filter(({id}) => {
      return id == obj.id
    }));
    if (!length) {
      return (
        <TouchableOpacity
            onPress={()=>{
              this.state.selectList.push(obj);
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

    const {query,selectList} = this.state;
    const filteredProds = this.findFilm(query);
    const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();
    return (
        <View style={{flex: 1, position: 'relative',}}>
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
                <Text> {tool.length(selectList)}</Text>
                <Image
                    style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                    source={require('../../img/Public/xiangxia_.png')}
                />
              </CellFooter>
            </Cell>
          </Cells>
          <View style={styles.container}>
            <Autocomplete
                autoCapitalize="none"
                containerStyle={[styles.autocompleteContainer]}
                inputContainerStyle={{borderColor: colors.main_color, borderWidth: pxToDp(1), borderRadius: pxToDp(5)}}
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
                      <Text style={[styles.itemText,{zIndex:101}]}>
                        {obj.name}
                      </Text>
                    </TouchableOpacity>
                )}
                underlineColorAndroid={'transparent'}
            />
            {
              this.state.hideResults?<View style={{marginTop: pxToDp(60),zIndex:100}}>

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
              </View>:null
            }
          </View>
          <Toast
              icon="loading"
              show={this.state.loadingProds}
              onRequestClose={() => {
              }}
          >加载中</Toast>

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
              this.state.selectList.map((item, index) => {
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
                      <CellBody style={{paddingLeft: pxToDp(10), marginRight: pxToDp(60),flex:1}}>
                        <Text numberOfLines={2} style={{width:'100%'}}>{name}</Text>
                        <Text>#{id}</Text>
                      </CellBody>
                      <CellFooter>
                        <TouchableOpacity
                        onPress={()=>{
                          this.state.selectList.splice(index,1);
                          this.forceUpdate();
                        }}
                        >
                          <Text>移除</Text>
                        </TouchableOpacity>
                      </CellFooter>
                    </Cell>
                )
              })
            }
          </ActivityDialog>
          <BottomBtn onPress={()=>{
            console.log(99999);
          }}/>

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