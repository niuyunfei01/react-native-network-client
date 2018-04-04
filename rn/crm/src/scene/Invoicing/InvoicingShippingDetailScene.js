import React, {PureComponent} from 'react';
import {ScrollView, Switch, Text, View,} from 'react-native'
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import font from './fontStyles'
import MyBtn from '../../common/MyBtn'
import CheckboxCells from './check_box'

import * as globalActions from '../../reducers/global/globalActions';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class InvoicingShippingDetailScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {req} = (navigation.state.params || {});
    let storeName = req['store_name'];
    return {
      headerTitle: storeName,

    }
  };

  constructor(props) {
    super(props)
    this.state = {
      req: {},
      suppliers: []
    }
  }

  componentWillMount(){
    const {req, suppliers} = (this.props.navigation.state.params || {});
    this.setState({req: req, suppliers:suppliers});
    let reqItems = req['req_items'];
    let checkItems = reqItems.map(function (item, idx) {
      return {label: item['name'], id: item['id']}
    });
    this.setState({checkItems: checkItems})
  }

  renderSuppliers(){
    let suppliers = this.state.suppliers;
    let s = suppliers.map(function (item, idx) {
      return <Text style={[styles.item_left, font.fontBlue]} key={idx}>{item['name']}(1)</Text>;
    });
    return s;
  }

  render() {
    let req = this.state.req;
    let checkItems = this.state.checkItems;
    return (
      <View style={{flex: 1}}>
        <Text style={styles.header_text}>{req['remark']}</Text>
        <View style={{flexDirection: 'row'}}>
          <ScrollView style={styles.left_list}>
            {this.renderSuppliers()}
          </ScrollView>
          <ScrollView style={styles.left_right}>
            <CheckboxCells
              options={checkItems}
              value={[{label: 2, id: 2}]}
              onChange={(checked) => {
              }}
              style={{
                marginLeft: 0,
                paddingLeft: 0,
                backgroundColor: "#fff",
                marginTop: 0
              }}
            />
          </ScrollView>
        </View>
        <View style={{
          flexDirection: 'row',
          position: 'absolute',
          left: 0,
          bottom: 0,
          height: pxToDp(100),
          backgroundColor: '#fff'
        }}>
          <View style={styles.switch}>
            <Text>跟单备注</Text>
            <Switch/>
          </View>
          <MyBtn text='下单' style={{
            height: pxToDp(100),
            textAlignVertical: 'center',
            textAlign: 'center',
            width: pxToDp(360),
            backgroundColor: colors.fontBlue,
            color: colors.white
          }}/>
        </View>
      </View>
    )
  }
}

const styles = {
  header_text: {
    height: pxToDp(100),
    backgroundColor: colors.white,
    textAlignVertical: 'center',
    paddingHorizontal: pxToDp(30),
    borderBottomColor: colors.fontBlack,
    borderBottomWidth: pxToDp(1),
  },
  left_list: {
    width: '30%',
    height: '100%',
  },
  left_right: {
    width: '70%',
    height: '100%',
  },
  item_left: {
    textAlign: 'center',
    backgroundColor: colors.white,
    marginRight: pxToDp(10),
    height: pxToDp(100),
    marginBottom: pxToDp(4),
    fontSize: 12,
    textAlignVertical: 'center',
    color: colors.fontGray,
  },
  item_right: {
    backgroundColor: colors.white,
  },
  switch: {
    width: pxToDp(360),
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: "center"
  }
};


export default connect(mapStateToProps, mapDispatchToProps)(InvoicingShippingDetailScene)