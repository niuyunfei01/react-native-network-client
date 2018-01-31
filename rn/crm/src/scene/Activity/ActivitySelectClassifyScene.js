import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  TouchableHighlight,
} from 'react-native';
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Label,
} from "../../weui/index";
import CheckboxCells from './myChecks'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";

import Config from "../../config";
import tool from '../../common/tool';
import Cts from '../../Cts';
import {ToastLong} from "../../util/ToastUtils";
import {Toast, Icon, Dialog} from "../../weui/index";
import style from './commonStyle'
import SelectBox from './SelectBox'
import {fetchListVendorTags} from "../../reducers/product/productActions";
import BottomBtn from './ActivityBottomBtn';
function mapStateToProps(state) {
  const {mine, global, activity} = state;
  return {mine: mine, global: global, activity: activity}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchListVendorTags,
      ...globalActions
    }, dispatch)
  }
}

class ActivitySelectClassifyScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    let {backPage} = params;
    return {
      headerTitle: '选择分类',

    }
  };

  constructor(props) {
    super(props);
    this.state = {
      list: [],
      checked: [],
      hide: false,
      vendorId: 0,
      platList: [
        Cts.WM_PLAT_ID_WX,
        Cts.WM_PLAT_ID_BD,
        Cts.WM_PLAT_ID_MT,
        Cts.WM_PLAT_ID_ELE,
        Cts.WM_PLAT_ID_JD,
      ],
      platId: Cts.WM_PLAT_ID_WX,
      showDialog: false,
      listJson:{}
    }
  }

  componentDidMount() {
    let {navigation} = this.props;

    this.getListVendorTags()
  }

  toggle = () => {
    let {hide} = this.state;
    this.setState({hide: !hide})
  };

  async getListVendorTags() {
    const {vendorId} = this.props.navigation.state.params;
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    this.setState({query: true});
    dispatch(fetchListVendorTags(vendorId, accessToken, (ok, desc, obj) => {
      if (ok) {
        this.setState({list: this.dataToCheck(obj)});
      } else {
        ToastLong(desc);
      }
    }));
  }

  dataToCheck(obj) {
    obj.forEach((item, index) => {
      if (item.id == Cts.GOODS_CLASSIFY_ALL || item.id == Cts.GOODS_CLASSIFY_UNCLASSIFIED) {
        obj.splice(index, 1)
      }
    });
    return obj;
  }
  getClassName(key) {
    let {list} = this.state;
    let name='';
    list.forEach((item) => {
      if(item.id==key){
        name= item.name
      }
    });
    return name;
  }
  renderSelectBox() {
    let {hide, vendorId, platList, platId,} = this.state;
    if (hide) {
      return (
          <SelectBox toggle={() => this.toggle()}>
            {
              platList.map((item, key) => {
                return (
                    <TouchableOpacity
                        key={key}
                        onPress={async () => {
                          this.setState({platId: item})
                        }}
                    >
                      <Text
                          style={platId == item ? [select.select_item, select.select_item_active] : [select.select_item, select.select_item_cancel]}>
                        {tool.get_platform_name(item)}
                      </Text>
                    </TouchableOpacity>
                )
              })
            }
            {
              platList.length % 3 === 2 ? <Text style={{width: pxToDp(172),}}/> : null
            }
          </SelectBox>
      )
    } else {
    }
    return null;
  }

  render() {
    let {checked,listJson} = this.state;
    return (
        <View style={{flex: 1, position: 'relative'}}>
          <ScrollView>
            <Cells style={style.cells}>
              <Cell customStyle={[style.cell, {paddingRight: pxToDp(10)}]}
                    onPress={() => {
                      this.setState({showDialog: true})
                    }}
              >
                <CellHeader>
                  <Text>已选分类</Text>
                </CellHeader>
                <CellFooter>
                  <Text> {this.state.checked.length}</Text>
                  <Image
                      style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                      source={require('../../img/Public/xiangxia_.png')}
                  />
                </CellFooter>
              </Cell>
            </Cells>
            <CheckboxCells
                options={this.state.list}
                values={this.state.checked}
                label={'name'}
                value={'id'}
                onChange={(checked) => {
                  this.setState({checked: checked})
                }}
                style={{marginLeft: 0, paddingLeft: 0, backgroundColor: "#fff"}}
            />
          </ScrollView>
          {
            this.renderSelectBox()
          }
          <Dialog onRequestClose={() => {}}
                  visible={this.state.showDialog}
                  title={'已选店铺'}
                  titleStyle={{textAlign: 'center', color: colors.fontBlack}}
                  headerStyle={{
                    backgroundColor: colors.main_back,
                    paddingTop: pxToDp(20),
                    justifyContent: 'center',
                    paddingBottom: pxToDp(20),
                  }}
                  buttons={[{
                    type: 'primary',
                    label: '确定',
                    onPress: () => {
                      this.setState({showDialog: false,});
                    }
                  }]}
                  footerStyle={{
                    borderTopWidth: pxToDp(1),
                    borderTopColor: colors.fontGray,
                  }}
                  bodyStyle={{
                    borderRadius: pxToDp(10),
                    marginLeft: pxToDp(15),
                    marginRight: pxToDp(15),
                    height: pxToDp(800),
                    marginTop: 0
                  }}
          >
            <ScrollView style={{height: pxToDp(700),}}>
              {
                checked.map((item, index) => {
                  return (
                      <Cell customStyle={[style.cell, {paddingLeft: pxToDp(15), paddingRight: pxToDp(15)}]}
                            first={index == 0}
                            key={index}
                      >
                        <CellHeader>
                          <Text>
                            {
                              this.getClassName(item)
                            }
                          </Text>
                        </CellHeader>
                        <TouchableOpacity
                            onPress={() => {
                              checked.splice(index,1)
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
                      </Cell>
                  )
                })
              }
            </ScrollView>
          </Dialog>
          <BottomBtn onPress={() => {
            let {checked}=this.state;
            this.props.navigation.state.params.nextSetBeforeCategories(checked,this.props.navigation.state.params.index);
            this.props.navigation.goBack();
          }}/>
        </View>
    )
  }
}

const select = StyleSheet.create({
  box: {
    flex: 1,
    position: 'absolute',
    zIndex: 100,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,.4)',
    height: '100%',
  },
  items_box: {
    minHeight: pxToDp(60),
    backgroundColor: "#fff",
    paddingHorizontal: pxToDp(45),
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: pxToDp(50),
    justifyContent: 'space-between',
    borderTopWidth: pxToDp(1)
  },
  select_item: {
    width: pxToDp(172),
    marginTop: pxToDp(48),
    height: pxToDp(55),
    textAlign: 'center',
    borderRadius: pxToDp(25),
    textAlignVertical: 'center',
    fontSize: pxToDp(28),
    marginBottom: pxToDp(2)
  },
  select_item_active: {
    backgroundColor: colors.main_color,
    color: colors.white,
  },
  select_item_cancel: {
    borderWidth: pxToDp(1),
    borderColor: colors.fontGray
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ActivitySelectClassifyScene)
