import React, {PureComponent} from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    StyleSheet,
    Pressable,
    Text,
    TextInput,
    View
} from 'react-native'
import Config from "../../common/config";
import {showError, showSuccess, ToastShort} from "../../util/ToastUtils";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import HttpUtils from "../../util/http";

const height = Dimensions.get("window").height;
export default class NewBottomMadal extends PureComponent {

    state = {
        editGood: {},
        data: this.props.storePro?.skus?.length > 0 && this.props.storePro?.skus?.sort((a, b) => {
            return a.sku_name > b.sku_name
        }) || [this.props.storePro?.sp] || []
    }
    onChangeText = (product_id, amount, totalRemain, price, before_price, strict_providing, type) => {
        const amountLength = amount.length, priceLength = price.split('.')[0].length
        if (amountLength <= 0 || priceLength <= 0) {
            showError('数据不可为空', 1);
        }
        if ('amount' === type && amountLength > 4)
            amount = '9999'
        if ('price' === type && priceLength > 4)
            price = '9999'
        const {editGood} = this.state
        editGood[product_id] = {
            product_id: product_id,
            auto_on_sale: 0,
            apply_price: price,
            actualNum: amount,
            before_price: before_price,
            strict_providing: strict_providing,
            totalRemain: totalRemain
        }
        this.setState({
            editGood: {...editGood}
        })
    }

    inventoryHistory = (id) => {
        const {navigation, storeId, onClose} = this.props
        onClose()
        navigation.navigate(Config.ROUTE_INVENTORY_STOCK_CHECK_HISTORY, {
            productId: id,
            storeId: storeId
        })
    }

    renderItem = (item) => {
        const {product_id, sku_name, left_since_last_stat, supply_price, strict_providing} = item.item
        const {index} = item
        const {editGood} = this.state
        const price = undefined === editGood[product_id] ? parseFloat(supply_price / 100).toFixed(2) : editGood[product_id].apply_price
        const amount = undefined === editGood[product_id] ? left_since_last_stat : editGood[product_id].actualNum
        const autoFocus = index === 0
        return (
            <View style={styles.itemWrap}>
                <Text style={styles.skuName}>
                    {sku_name || this.props.storePro.sku_name}
                </Text>
                <View style={styles.rowWrap}>
                    <View style={styles.row}>
                        <Text style={styles.textBold}>
                            价格
                        </Text>
                        <Text style={styles.text}>
                            （报价）
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <TextInput value={price}
                                   autoFocus={autoFocus}
                                   returnKeyType={'done'}
                                   style={styles.textInput}
                                   keyboardType={'numeric'}
                                   placeholder={'请输入价格'}
                                   placeholderTextColor={'grey'}
                                   onChangeText={price => this.onChangeText(product_id, amount, left_since_last_stat, price, supply_price, strict_providing, 'price')}/>
                        <Text style={styles.textBold}>
                            元
                        </Text>
                    </View>
                </View>
                <If condition={strict_providing === '1'}>
                    <View style={styles.rowWrap}>
                        <View style={styles.row}>
                            <Text style={styles.textBold}>
                                库存
                            </Text>
                            <Text style={styles.inventoryHistory} onPress={() => this.inventoryHistory(product_id)}>
                                盘点历史
                            </Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.clearBtn}
                                  onPress={() => this.onChangeText(product_id, '0', left_since_last_stat, price, supply_price, strict_providing, 'amount')}>
                                清零
                            </Text>
                            <TextInput value={amount}
                                       returnKeyType={'done'}
                                       style={styles.textInput}
                                       keyboardType={'numeric'}
                                       placeholder={'请输入库存数量'}
                                       placeholderTextColor={'grey'}
                                       onChangeText={amount => this.onChangeText(product_id, amount, left_since_last_stat, price, supply_price, strict_providing, 'amount')}/>
                            <Text style={styles.textBold}>
                                件
                            </Text>
                        </View>
                    </View>
                </If>
            </View>
        )
    }

    done = (onClose) => {
        const {editGood} = this.state
        const {accessToken, storeId, vendor_id} = this.props
        const prices = [], inventory = []
        Object.keys(editGood).map((key) => {
            const obj = editGood[key]
            let apply_price = obj.apply_price
            if (obj.apply_price.indexOf('.') !== -1) {
                apply_price = (parseFloat(obj.apply_price)) * 100
            }
            prices.push({
                product_id: parseInt(obj.product_id),
                apply_price: `${apply_price}`,
                before_price: obj.before_price,
                remark: '',
                auto_on_sale: 0
            })
            if ('1' === obj.strict_providing)
                inventory.push({
                    productId: obj.product_id,
                    actualNum: obj.actualNum,
                    totalRemain: obj.totalRemain,
                    remark: '快速盘点',
                    differenceType: 2,
                    skipCheckChange: false
                })
        })
        const url = `/api_products/batch_update_store_price_inventory?access_token=${accessToken}&&store_id=${storeId}&&vendor_id=${vendor_id}`
        let params = {prices: prices}
        if (inventory.length > 0)
            params = {...params, inventorys: inventory}
        HttpUtils.post.bind(this.props)(url, params).then(res => {
            showSuccess('提交成功, 价格修改请等待审核',3)

        }).catch(e => {showError(e)})
        onClose()
    }

    getItemLayout = (data, index) => ({
        length: 120, offset: 120 * index, index
    })

    render() {
        const {onClose, visible} = this.props
        const {data} = this.state
        return (
            <Modal hardwareAccelerated={true} onRequestClose={onClose} transparent={true} visible={visible}>
                <View style={styles.container}>
                    <View style={styles.visibleArea}>
                        <View style={styles.btn}>
                            <Pressable onPress={onClose}>
                                <Text style={styles.cancelBtn}>
                                    取消
                                </Text>
                            </Pressable>
                            <Pressable onPress={() => this.done(onClose)}>
                                <Text style={styles.doneStyle}>
                                    完成
                                </Text>
                            </Pressable>
                        </View>
                        <FlatList data={data}
                                  renderItem={(item) => this.renderItem(item)}
                                  initialNumToRender={4}
                                  getItemLayout={(data, index) => this.getItemLayout(data, index)}
                                  keyExtractor={(item, index) => item.id}
                        />
                    </View>
                </View>
            </Modal>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.25)'
    },
    visibleArea: {
        backgroundColor: colors.white,
        padding: 10,
        borderRadius: pxToDp(30),
        width: '90%',
        maxHeight: height * 0.5
    },
    btn: {
        flexDirection: 'row',
        justifyContent: "space-between",
        padding: 8,
        borderBottomColor: 'gray',
        borderBottomWidth: 1
    },
    cancelBtn: {
        fontWeight: 'bold', color: '#000000'
    },
    doneStyle: {
        fontWeight: 'bold', color: 'green'
    },
    textInput: {
        padding: 4, width: 120, borderWidth: 1, borderColor: 'grey', textAlign: 'right'
    },
    textBold: {paddingTop: 4, paddingBottom: 4, fontWeight: 'bold', color: '#000000'},
    text: {paddingTop: 4, paddingBottom: 4},
    clearBtn: {
        color: 'green', borderColor: 'grey', borderWidth: 1, marginRight: 4
    },
    itemWrap: {
        padding: 8, borderBottomColor: 'gray', borderBottomWidth: 1, height: 120
    },
    skuName: {
        paddingBottom: 4, paddingLeft: 4, paddingRight: 4
    },
    rowWrap: {
        flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 4, paddingLeft: 4, paddingRight: 4
    },
    row: {
        flexDirection: 'row', alignItems: 'center'
    },
    inventoryHistory: {
        color: 'green', marginLeft: 4
    }
})