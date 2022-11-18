import React, {PureComponent} from 'react'
import {connect} from "react-redux";
import {
  Alert,
  Dimensions,
  InteractionManager,
  ScrollView,
  StyleSheet,
  Text, TextInput,
  View
} from 'react-native';
import {Button} from "react-native-elements";
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import HttpUtils from "../../../pubilc/util/http";
import AntDesign from "react-native-vector-icons/AntDesign";
import ModalSelector from "../../../pubilc/component/ModalSelector";
import Ionicons from "react-native-vector-icons/Ionicons";
import Scanner from "../../../pubilc/component/Scanner";
import {ToastShort} from "../../../pubilc/util/ToastUtils";

const width = Dimensions.get("window").width;

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

class GoodsAddSpecScence extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      weightList: [],
      selectWeight: {label: '克', value: 1},
      sku_name: '',
      weight: '',
      upc: '',
      scanBoolean: false,
      series_id: this.props.route.params?.series_id
    }
  }

  componentDidMount() {
    this.getWeightUnitList()
  }

  onPress = (route, params) => {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  getWeightUnitList = () => {
    const {accessToken} = this.props.global
    const url = `/api_products/weight_unit_lists?access_token=${accessToken}`
    HttpUtils.get(url).then(res => {
      this.setState({weightList: res})
    }).catch(error => {
      ToastShort(`${error.desc}`)
    })
  }

  onNameClear = () => {
    this.setState({sku_name: ''})
  }

  onNameChanged = (name) => {
    this.setState({sku_name: name})
  }

  startScan = () => {
    this.setState({
      scanBoolean: true
    });
  };

  onScanSuccess = (code) => {
    if (code) {
      this.setState({upc: code})
    }
  }

  onScanFail = () => {
    Alert.alert('错误提示', '商品编码不合法，请重新扫描', [{text: '确定'}]);
  }

  submitSpec = () => {
    let {
      sku_name, weight, upc, selectWeight, series_id
    } = this.state;
    if (sku_name === '') {
      ToastShort('请完善规格名称！')
      return
    }
    if (weight === '') {
      ToastShort('请完善规格重量！')
      return
    }
    const api = `/v1/new_api/store_product/save_product_sku`
    HttpUtils.post.bind(this.props)(api, {
      sku_name: sku_name,
      id: 0,
      series_id: series_id,
      sku_unit: selectWeight.label,
      weight: weight,
      upc: upc
    }).then(res => {
      ToastShort(res.desc);
      setTimeout(() => {
        this.props.navigation.goBack()
      }, 800)
    }).catch((res) => {
      ToastShort("操作失败：" + res.desc);
    })
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <ScrollView
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={styles.Content}>
          {this.renderEditInfo()}
        </ScrollView>
        {this.renderBtn()}
        {this.renderScanner()}
      </View>
    );
  }

  renderEditInfo = () => {
    let {
      weightList, selectWeight, sku_name, weight, upc
    } = this.state
    return (
      <View style={styles.InfoBox}>
        <View style={styles.item_body}>
          <View style={styles.item_row}>
            <Text style={styles.item_title}>规格信息 </Text>
          </View>
          <View style={[styles.item_row, {justifyContent: "space-between"}]}>
            <View style={styles.flexRow}>
              <Text style={styles.row_label}>规格名称 </Text>
              <Text style={{color: '#F81212'}}>* </Text>
            </View>
            <TextInput
              value={sku_name}
              style={styles.textInputStyle}
              onChangeText={text => this.onNameChanged(text)}
              placeholderTextColor={colors.color999}
              placeholder={'不超过40个字符'}/>
            <If condition={sku_name}>
              <Text style={styles.clearBtn} onPress={this.onNameClear}>
                清除
              </Text>
            </If>
          </View>
          <View style={[styles.item_row, styles.weightRow]}>
            <View style={styles.flexRow}>
              <Text style={styles.row_label}>重量 </Text>
              <Text style={{color: '#F81212'}}>* </Text>
            </View>
            <TextInput
              style={styles.textInputStyle}
              value={`${weight}`}
              keyboardType={'numeric'}
              onChangeText={text => this.setState({weight: text})}
              placeholderTextColor={colors.color999}
              placeholder={'请输入商品重量'}/>
            <ModalSelector style={{width: 40}}
                           data={weightList}
                           skin={'customer'}
                           onChange={item => this.setState({selectWeight: item})}
                           defaultKey={-999}>
              <View style={styles.selectWeight}>
                <Text style={styles.selectWeightLabel}>
                  {`${selectWeight.label}`}
                </Text>
                <AntDesign name={'right'} style={{textAlign: 'center'}} color={colors.color999} size={14}/>
              </View>
            </ModalSelector>
          </View>
          <View style={[styles.item_row, {justifyContent: "space-between"}]}>
            <View style={styles.flexRow}>
              <Text style={styles.row_label}>商品条码 </Text>
            </View>
            <TextInput
              value={upc}
              onChangeText={upc => this.setState({upc: upc})}
              style={styles.textInputStyle}
              placeholderTextColor={colors.color999}
              placeholder={'请扫描或输入条形码'}/>
            <Ionicons name={'scan-sharp'} style={styles.rightEmptyView} color={colors.color333} size={22}
                      onPress={() => this.startScan()}/>
          </View>
        </View>
      </View>
    )
  }

  renderScanner = () => {
    const {scanBoolean} = this.state
    return (
      <Scanner visible={scanBoolean} title="返回"
               onClose={() => this.setState({scanBoolean: false})}
               onScanSuccess={code => this.onScanSuccess(code)}
               onScanFail={code => this.onScanFail(code)}/>
    )
  }

  renderBtn = () => {
    return (
      <View style={styles.bottomBtn}>
        <Button title={'提交'}
                onPress={() => {this.submitSpec()}}
                containerStyle={{flex: 1}}
                buttonStyle={styles.btn}
                titleStyle={styles.btnTitle}
        />
      </View>
    )
  }

}

const styles = StyleSheet.create({
  Content: {backgroundColor: '#F5F5F5'},
  flexRow: {flexDirection: "row"},
  InfoBox: {
    width: width * 0.94,
    marginLeft: width * 0.03,
    marginTop: pxToDp(15)
  },
  item_body: {
    backgroundColor: colors.white,
    borderRadius: 6,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: pxToDp(5)
  },
  item_row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10
  },
  item_title: {
    fontSize: 16,
    color: colors.color333,
    fontWeight: "bold"
  },
  row_label: {fontSize: 16, color: colors.color333, fontWeight: "bold"},
  bottomBtn: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.white,
    padding: 10
  },
  btn: {
    backgroundColor: colors.main_color,
    borderRadius: 20
  },
  btnTitle: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 22
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.e5
  },
  clearBtn: {
    alignItems: 'center', justifyContent: 'center',
    fontSize: 14,
    color: colors.main_color,
    marginRight: pxToDp(22)
  },
  textInputStyle: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 12,
    marginLeft: 10
  },
  rightEmptyView: {
    textAlign: 'center',
    width: 40,
  },
  selectWeight: {flex: 1, flexDirection: 'row', alignItems: 'center', width: 40, justifyContent: 'center'},
  selectWeightLabel: {fontSize: 14, fontWeight: '400', color: colors.color333, lineHeight: 17},
  weightRow: {justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.e5, borderBottomColor: colors.e5, borderBottomWidth: 1}
});

export default connect(mapStateToProps)(GoodsAddSpecScence)
