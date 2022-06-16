import React, {PureComponent} from "react";
import PropTypes from "prop-types";
import ReactNative, {Image, Platform, Text, TouchableOpacity, View} from "react-native";
import pxToDp from "../util/pxToDp";
import colors from "../styles/colors";
import screen from "../util/screen";
import Config from "../common/config";
import styles from "../../scene/order/OrderStyles";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import pxToEm from "../util/pxToEm";
import numeral from "numeral";
import InputNumber from "rc-input-number";
import inputNumberStyles from "../../scene/order/inputNumberStyles";
const {StyleSheet} = ReactNative
const _editNum = function (edited, item) {
  return edited ? edited.num - (item.origin_num === null ? item.num : item.origin_num) : 0;
};

class ItemRow extends PureComponent {
  static propTypes = {
    item: PropTypes.object.isRequired,
    orderStoreId: PropTypes.string.isRequired,
    idx: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    isEditing: PropTypes.bool,
    isAdd: PropTypes.bool,
    edits: PropTypes.object,
    onInputNumberChange: PropTypes.func,
    nav: PropTypes.object,
    fnShowWmPrice: PropTypes.bool
  }

  constructor(props) {
    super(props);
  }

  render() {
    const {
      idx, item, isAdd, edited, orderStoreId, onInputNumberChange = () => {
      }, isEditing = false, nav, fnShowWmPrice, fnPriceControlled, isServiceMgr = false
    } = this.props;

    if (item.crm_order_detail_hide) {
      return null
    }

    const editNum = _editNum(edited, item);

    const showEditAdded = isEditing && !isAdd && edited && editNum !== 0;
    const isPromotion = Math.abs(item.price * 100 - item.normal_price) >= 1;

    return <View key={idx} style={Styles.ItemRowHeader}>
      <View style={Styles.ItemRowContent}>
        <TouchableOpacity
            onPress={() => {
              let {product_id} = item
              nav.navigate(Config.ROUTE_GOOD_STORE_DETAIL, {pid: product_id, storeId: orderStoreId, item: item})
            }}
        >
          {
            !!item.product_img ?
                <Image
                    style={styles.product_img}
                    source={{uri: item.product_img}}
                /> :
                <FontAwesome5 name={'file-image'} size={45} style={Styles.fileImg}/>
          }
        </TouchableOpacity>
        <View>
          <Text style={Styles.ContentText}>
            <If condition={item.shelf_no}>{item.shelf_no} </If>{item.name}
            <Text style={Styles.productIdText}>(#{item.product_id}<If
                condition={item.tag_code}>[{item.tag_code}]</If>) </Text>
          </Text>

          <View style={Styles.isMgrContent}>
            {/*管理员看到的*/}
            <If condition={isServiceMgr || fnShowWmPrice}>
              <Text style={styles.priceMode}>保</Text>
              <Text style={Styles.color44140}>{numeral(item.supply_price / 100).format('0.00')} </Text>
              <View style={Styles.ml30}/>
              <Text style={styles.priceMode}>外</Text>
              <Text style={Styles.color44140}>{numeral(item.price).format('0.00')} </Text>
            </If>
            {/*商户看到的*/}
            <If condition={!isServiceMgr && !fnShowWmPrice}>
              {/*保底模式*/}
              <If condition={fnPriceControlled}>
                <View style={Styles.isMgrContent}>
                  <Text style={[styles.priceMode]}>保</Text>
                  <Text style={Styles.color44140}>{numeral(item.supply_price / 100).format('0.00')} </Text>
                </View>
                <Text style={Styles.countMoney}>
                  总价 {numeral(item.supply_price / 100 * item.num).format('0.00')}
                </Text>
              </If>
              {/*联营模式*/}
              <If condition={!fnPriceControlled}>
                <Text style={styles.priceMode}>外</Text>
                <Text style={Styles.color44140}>{numeral(item.price).format('0.00')} </Text>
                <If condition={!isAdd}>
                  <Text style={Styles.fnPrice}>
                    总价 {numeral(item.price * item.num).format('0.00')}
                  </Text>
                </If>
              </If>
            </If>
          </View>
        </View>
      </View>
      {isEditing && !isAdd && edited && edited.num < item.num ? (<View style={Styles.editNum}>
        <Text
            style={[styles.editStatus, Styles.editStatusDeduct]}>已减{-editNum}件</Text>
        <Text
            style={[styles.editStatus, Styles.editStatusDeduct]}>退{numeral(-editNum * item.price).format('0.00')} </Text>
      </View>) : (showEditAdded && <View style={{alignItems: 'flex-end', flex: 1}}>
        <Text style={[styles.editStatus, Styles.editStatusAdd]}>已加{editNum}件</Text>
        <Text
            style={[styles.editStatus, Styles.editStatusAdd]}>收{numeral(editNum * item.normal_price / 100).format('0.00')} </Text>
      </View>)}

      {isEditing && isAdd && <View style={{alignItems: 'flex-end', flex: 1}}>
        <Text style={[styles.editStatus, Styles.editStatusAdd]}>加货{item.num} </Text>
        <Text
            style={[styles.editStatus, Styles.editStatusAdd]}>收{numeral(item.num * item.price).format('0.00')} </Text>
      </View>}

      {isPromotion &&
      <Text style={[styles.editStatus, Styles.isPromotion]}>促销</Text>
      }
      {(!isEditing || isPromotion) &&
      <Text style={[item.num > 1 ? Styles.isEdtingOn : Styles.isEdting, Styles.numText]}>X{item.num} </Text>}

      {isEditing && !isPromotion &&
      <View style={styles.flex1}>
        <InputNumber
            styles={inputNumberStyles}
            min={0}
            value={(edited || item).num}
            style={Styles.isEdtingInput}
            onChange={(v) => {
              onInputNumberChange(item, v)
            }}
            keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
        />
      </View>}
    </View>
  }
}

const Styles = StyleSheet.create({
  ItemRowHeader: {
    marginTop: pxToDp(12),
    flexDirection: 'row',
    alignContent: 'center',
    paddingTop: pxToDp(14),
    paddingBottom: pxToDp(14),
    borderBottomColor: colors.color999,
    borderBottomWidth: screen.onePixel,
  },
  ItemRowContent: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center'
  },
  fileImg: {
    width: pxToDp(90),
    height: pxToDp(90),
    fontSize: pxToDp(90),
    color: colors.color666,
    marginRight: pxToDp(15),
    paddingLeft: pxToDp(15),
    borderRadius: 10
  },
  ContentText: {
    fontSize: pxToEm(26),
    color: colors.color333,
    marginBottom: pxToDp(14),
  },
  productIdText: {fontSize: pxToEm(22), color: colors.fontGray},
  isMgrContent: {flexDirection: 'row', alignItems: 'center'},
  color44140: {color: '#f44140'},
  ml30: {marginLeft: 30},
  countMoney: {color: '#f9b5b2', flex: 1},
  fnPrice: {color: '#f9b5b2', marginLeft: 30},
  editNum: {alignItems: 'flex-end', flex: 1},
  editStatusDeduct: {backgroundColor: colors.editStatusDeduct, opacity: 0.7},
  editStatusAdd: {backgroundColor: colors.editStatusAdd, opacity: 0.7},
  isPromotion: {alignSelf: 'flex-end', flex: 1, color: colors.color999},
  isEdtingOn: {alignSelf: 'flex-end', fontSize: pxToEm(26), color: '#f44140'},
  isEdting: {
    alignSelf: 'flex-end',
    fontSize: pxToEm(26),
    color: colors.color666
  },
  numText: {flex: 1, textAlign: 'right'},
  isEdtingInput: {
    backgroundColor: 'white',
    width: Platform.OS === 'ios' ? 70 : 80,
  }
})

export default ItemRow