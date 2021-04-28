import React from 'react'
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import Config from "../../config";

import {connect} from "react-redux";
import InventoryItems from "./InventoryItems";
import HttpUtils from "../../util/http";

const mapStateToProps = ({global}) => ({global})
const mapDispatchToProps = dispatch => {
  return {
    dispatch,
  }
}

class InventoryHome extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '库存'
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      sum_cost: ''
    }
  }

  UNSAFE_componentWillMount () {
    let {accessToken, currStoreId} = this.props.global;
    HttpUtils.get.bind(this.props)('/api_products/inventory_summary/'+currStoreId, {access_token: accessToken}).then((obj) => {
      this.setState({sum_cost: obj.sum_cost})
    })
  }

  render () {
    return (
      <View style={styles.page}>
        <View style={styles.container}>
          <TouchableOpacity
            style={[styles.item, {backgroundColor: '#f37b1d'}]}
            onPress={() => {
              this.props.navigation.navigate(Config.ROUTE_INVENTORY_MATERIAL_LIST)}}>
            <View style={styles.itemView}>
              <Text style={styles.itemText}>原料入库</Text>
              <Text style={styles.itemText}/>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.item, {backgroundColor: '#39b54a'}]}
            onPress={() => {this.props.navigation.navigate('InventoryItems', {})}} >
            <View style={styles.itemView}>
              <Text style={styles.itemText}>实时库存</Text>
              <Text style={styles.itemText}>{this._getSumCostText()}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.item, {backgroundColor: '#fbbd08'}]}>
            <View style={styles.itemView}>
              <Text style={styles.itemText}>库存历史</Text>
              <Text style={styles.itemText}>(待实现）</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.item, {backgroundColor: '#8dc63f'}]}>
            <View style={styles.itemView}>
              <Text style={styles.itemText}>毛利分析</Text>
              <Text style={styles.itemText}>(待实现)</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  _getSumCostText() {
    return `(${this.state.sum_cost ? parseFloat(this.state.sum_cost / 100).toFixed(2) + '元' : ''})`;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InventoryHome)

const styles = StyleSheet.create({
  page: {
    width: '100%',
    height: '100%',
    justifyContent: 'center'
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  item: {
    width: 150,
    height: 150,
    borderWidth: 1,
    borderColor: '#ececec',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    borderRadius: 10
  },
  itemView: {
    alignItems: 'center'
  },
  itemText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600'
  }
})
