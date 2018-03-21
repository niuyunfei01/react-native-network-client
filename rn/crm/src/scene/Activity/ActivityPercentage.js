import React, {PureComponent} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import style from "./commonStyle";
import tool from "../../common/tool";
import {ToastLong} from "../../util/ToastUtils";
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Label,
} from "../../weui/index";
 class Percentage extends PureComponent {
  render() {
    let {min_price, max_price, percent, tail, text} = this.props || {};
    return (
        <Cell customStyle={style.cell} first={false}>
          {
            text ? <CellHeader>
              {
                tail ? <Text style={style.cell_header_text}>{tool.toFixed(min_price, 'int')}元以上</Text>
                    : <Text
                        style={style.cell_header_text}>{tool.toFixed(min_price, 'int')}元--{tool.toFixed(max_price, 'int')}元</Text>
              }
            </CellHeader> : <CellHeader/>
          }
          <CellFooter>
            <TouchableOpacity
                onPress={() => {
                  if (percent > 100) {
                    this.props.onPressReduce()
                  } else {
                    ToastLong('加价比例不能小于100%')
                  }
                }
                }
            >
              <Image style={style.operation}
                     source={percent <= 100 ? require('../../img/Activity/jianshaohui_.png') : require('../../img/Activity/jianshao_.png')}
              />
            </TouchableOpacity>
            <Text style={style.percentage_text}>{percent}%</Text>
            <TouchableOpacity
                onPress={() => this.props.onPressAdd()}
            >
              <Image style={style.operation} source={require('../../img/Activity/zengjia_.png')}/>
            </TouchableOpacity>
          </CellFooter>
        </Cell>
    )
  }
}

export default Percentage
