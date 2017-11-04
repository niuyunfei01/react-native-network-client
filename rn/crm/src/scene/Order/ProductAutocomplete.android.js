import Autocomplete from 'react-native-autocomplete-input';
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import InputNumber from 'rc-input-number';
import inputNumberStyles from './inputNumberStyles';
import pxToDp from "../../util/pxToDp";
import {getProdPricesList, keyOfProdInfos} from '../../reducers/product/productActions';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {Button, ActionSheet, ButtonArea, Toast, Msg, Dialog, Icon} from "../../weui/index";

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
  static renderFilm(prod) {
    const { name, pid, price, saleStatus } = prod;

    return (
      <View>
        <Text style={styles.titleText}>[{saleStatus}] {name}</Text>
        <Text style={styles.directorText}>({pid})</Text>
        <Text style={styles.openingText}>{price}</Text>
      </View>
    );
  }

  constructor(props) {
    super(props);
    this.state = {
      films: [],
      query: '',
      itemNumber: 0,
      prodInfos: {},
      loadingInfoError: '',
      loadingProds: false,
    };
    this._onInputNumberChange = this._onInputNumberChange.bind(this)
  }

  componentDidMount() {

    const {esId, platform, storeId} = (this.props.navigation.state.params || {});
    const key = keyOfProdInfos(esId, platform, storeId);
    const prodInfos = (this.props.product.prodInfos || {})[key];
    if (!prodInfos) {
      this.setState({loadingProds: true});
      const {dispatch} = this.props;
      const token = this.props.global.accessToken;
      dispatch(getProdPricesList(token, esId, platform, storeId, (ok, msg, data) => {
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
  }

  findFilm(query) {
    if (query === '') {
      return [];
    }

    const { prodInfos }  = this.state;
    const regex = new RegExp(`${query.trim()}`, 'i');
    return Object.keys(prodInfos).map((k) => prodInfos[k]).filter(prod => prod.name.search(regex) >= 0);
  }

  _onInputNumberChange(v) {
    this.setState({itemNumber: v});
  }

  render() {

    const { query } = this.state;
    const filteredProds = this.findFilm(query);
    const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();

    return (
      <View style={styles.container}>
        <View style={{flexDirection: 'row'}}>
          <Autocomplete
            autoCapitalize="none"
            autoCorrect={false}
            containerStyle={[styles.autocompleteContainer, {paddingLeft: pxToDp(30)}]}
            data={filteredProds.length === 1 && comp(query, filteredProds[0].name) ? [] : filteredProds}
            defaultValue={query}
            onChangeText={text => this.setState({query: text})}
            placeholder="Enter Star Wars film title"
            renderItem={({name, price, pid}) => (
              <TouchableOpacity onPress={() => this.setState({query: name})}>
                <Text style={styles.itemText}>
                  {name} ({price})
                </Text>
              </TouchableOpacity>
            )}
            underlineColorAndroid={'transparent'}
          />

          <View style={{flex: 1}}/>
          <InputNumber
            styles={inputNumberStyles}
            min={0}
            inputStyle={{width: 50, flex: 0}}
            onChange={(v) => {this._onInputNumberChange(v)}}
            keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
          />
        </View>
        <View style={styles.descriptionContainer}>
          {filteredProds.length > 0 ? (
            ProductAutocomplete.renderFilm(filteredProds[0])
          ) : (
            <Text style={styles.infoText}>
              输入商品名模糊查找
            </Text>
          )}
        </View>


        <Dialog onRequestClose={() => {}}
                visible={!!this.state.loadingInfoError}
                buttons={[{
                  type: 'default',
                  label: '知道了',
                  onPress: () => {
                    this.setState({loadingInfoError: ''})
                  }
                }]}
        ><Text>{this.state.loadingInfoError}</Text></Dialog>

        <Toast
          icon="loading"
          show={this.state.loadingProds}
          onRequestClose={() => {
          }}
        >加载中</Toast>
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
    right: 160,
    top: 0,
    zIndex: 1
  },
  itemText: {
    fontSize: 15,
    margin: 2
  },
  descriptionContainer: {
    // `backgroundColor` needs to be set otherwise the
    // autocomplete input will disappear on text input.
    backgroundColor: '#F5FCFF',
    marginTop: 25
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