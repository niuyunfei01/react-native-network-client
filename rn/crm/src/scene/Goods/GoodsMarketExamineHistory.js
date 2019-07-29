import React from "react";
import BaseComponent from "../BaseComponent";
import {connect} from "react-redux";
import {StyleSheet, View} from "react-native";
import {Echarts} from 'react-native-secharts';
import Color from '../../styles/colors'
import HttpUtils from "../../util/http";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class GoodsMarketExamineHistory extends BaseComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: `价格市调历史`
    }
  }
  
  constructor (props) {
    super(props);
    this.state = {
      options: {},
    }
    this.echart1 = React.createRef();
  }
  
  componentWillMount () {
    this.fetchData()
  }
  
  fetchData () {
    const self = this
    const accessToken = this.props.global.accessToken
    const productId = this.props.navigation.state.params.productId
    const uri = `/api_products/product_market_price_history/${productId}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(uri).then(res => {
      let x = res.map(item => item.date)
      let y = res.map(item => item.market_price)
      self.setState({options: self._getEchartOptions(x, y)})
    })
  }
  
  _getEchartOptions (x, y) {
    return {
      tooltip: {
        trigger: 'none',
        axisPointer: {
          type: 'cross'
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: x
      },
      yAxis: {
        type: 'value'
      },
      color: Color.default_theme,
      series: [{
        data: y,
        type: 'line',
        itemStyle: {normal: {label: {show: true}}}
      }]
    }
  }
  
  renderEchart () {
    return (
      <Echarts ref={this.echart1} option={this.state.options} height={300} width={'100%'}/>
    )
  }
  
  render () {
    return (
      <View style={{flex: 1}}>
        <View style={{backgroundColor: '#fff'}}>
          {this.renderEchart()}
        </View>
      </View>
    )
  }
}

export default connect(mapStateToProps)(GoodsMarketExamineHistory)

const styles = StyleSheet.create({})