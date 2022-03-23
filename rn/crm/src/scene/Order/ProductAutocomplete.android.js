import Autocomplete from 'react-native-autocomplete-input';
import React, {Component} from 'react';
import {Platform, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import InputNumber from 'rc-input-number';
import inputNumberStyles from './inputNumberStyles';
import pxToDp from "../../util/pxToDp";
import {getProdPricesList, keyOfProdInfos} from '../../reducers/product/productActions';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {Dialog} from "../../weui/index";
import colors from "../../styles/colors";
import NavigationItem from "../../widget/NavigationItem";
import {hideModal, showModal} from "../../util/ToastUtils";

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
      getProdPricesList,
    }, dispatch)
  }
}

class ProductAutocomplete extends Component {

  constructor(props) {
    super(props);
    this.state = {
      query: '',
      pid: 0,
      itemNumber: 0,
      numOfPid: {},
      prodInfos: {},
      loadingInfoError: '',
      loadingProds: false,
    };
    this._onInputNumberChange = this._onInputNumberChange.bind(this);
    this._onProdSelected = this._onProdSelected.bind(this);
    this._hasPid = this._hasPid.bind(this);
    this._onSaveAndClose = this._onSaveAndClose.bind(this);
    this.savingDisabled = false

    this.navigationOptions(this.props)
  }

  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: '选择商品',
      headerRight: <NavigationItem
        title="保存"
        onPress={this._onSaveAndClose.bind(this)}
        disabled={this.savingDisabled}
      />,
    })
  };

  componentDidMount() {

    const {dispatch, navigation} = this.props;

    const {esId, platform, storeId} = (this.props.route.params || {});
    const key = keyOfProdInfos(esId, platform, storeId);
    const prodInfos = (this.props.product.prodInfos || {})[key];
    if (!prodInfos) {
      this.setState({loadingProds: true});
      showModal('加载中')
      const token = this.props.global.accessToken;
      dispatch(getProdPricesList(token, esId, platform, storeId, (ok, msg, data) => {
        hideModal()
        if (ok && data) {
          this.setState({loadingProds: false, prodInfos: data})
        } else {
          if (!data && ok) {
            msg = '本店下暂无产品';
          }
          this.setState({loadingInfoError: msg, loadingProds: false});
        }
      }));
    } else {
      this.setState({prodInfos});
    }

    this.savingDisabled = true
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
      return [];
    }
  }

  _hasPid() {
    const has = this.state.pid !== '' && this.state.pid !== 0 && this.state.pid !== '0';
    return has;
  }

  _onProdSelected(name, pid, price) {
    const num = this.state.numOfPid[pid] || 1;
    this.setState({query: name, itemNumber: num, pid, numOfPid: {...this.state.numOfPid, [pid]: num}});

    const {dispatch, navigation} = this.props;
    navigation.setParams({savingDisabled: false});
  }

  _onInputNumberChange(v) {
    this.setState({itemNumber: v, numOfPid: {...this.state.numOfPid, [this.state.pid]: v}});

    const {dispatch, navigation} = this.props;
    navigation.setParams({savingDisabled: !v});
  }

  _onSaveAndClose() {
    const {dispatch, navigation} = this.props;
    const {goBack, state} = this.props.navigation;
    const params = state.params;
    if (params.actionBeforeBack && this.state.pid) {
      const prod = this.state.prodInfos[this.state.pid];
      const num = this.state.numOfPid[this.state.pid];
      params.actionBeforeBack(prod, num);
    }
    goBack()
  }

  render() {

    const {query} = this.state;
    const filteredProds = this.findFilm(query);
    const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();
    return (
      <View style={styles.container}>
        <Autocomplete
          autoCapitalize="none"
          autoCorrect={false}
          containerStyle={[styles.autocompleteContainer]}
          data={filteredProds.length === 1 && comp(query, filteredProds[0].name) ? [] : filteredProds}
          defaultValue={query}
          onChangeText={text => this.setState({query: text})}
          placeholder="输入商品名模糊查找"
          renderItem={({name, price, pid}) => (
            <TouchableOpacity onPress={() => this._onProdSelected(name, pid, price)}>
              <Text style={styles.itemText}>
                {name} ({price})
              </Text>
            </TouchableOpacity>
          )}
          underlineColorAndroid={'transparent'}
        />

        {this._hasPid() && <View>
          <View style={{
            marginTop: pxToDp(120), height: 44,
            paddingHorizontal: 10,
          }}>
            <InputNumber
              styles={inputNumberStyles}
              min={0}
              value={this.state.itemNumber}
              inputStyle={{width: 50, flex: 0, height: pxToDp(100)}}
              onChange={(v) => {
                this._onInputNumberChange(v)
              }}
              keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
            />
          </View>
          <View style={{flexDirection: 'row', marginTop: pxToDp(80)}}>
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={styles.moneyLabel}>单价</Text>
              <Text style={styles.moneyText}>{(this.state.prodInfos[this.state.pid] || {}).price}/件</Text>
            </View>

            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={[styles.moneyLabel]}>总额</Text>
              <Text
                style={[styles.moneyText]}>{numeral((this.state.prodInfos[this.state.pid] || {}).price * (this.state.numOfPid[this.state.pid] || 1)).format('0.00')}元</Text>
            </View>

          </View>
        </View>}

        <Dialog onRequestClose={() => {
        }}
                visible={!!this.state.loadingInfoError}
                buttons={[{
                  type: 'default',
                  label: '知道了',
                  onPress: () => {
                    this.setState({loadingInfoError: ''})
                  }
                }]}
        ><Text>{this.state.loadingInfoError} </Text></Dialog>

        {/*<Toast*/}
        {/*  icon="loading"*/}
        {/*  show={this.state.loadingProds}*/}
        {/*  onRequestClose={() => {*/}
        {/*  }}*/}
        {/*>加载中</Toast>*/}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5FCFF',
    flex: 1,
    paddingTop: 25
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: pxToDp(30),
    top: 0,
    paddingLeft: pxToDp(30),
    paddingTop: pxToDp(20),
    zIndex: 1
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
