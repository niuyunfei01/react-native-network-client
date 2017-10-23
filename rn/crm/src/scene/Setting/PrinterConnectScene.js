//import liraries
import React, {PureComponent} from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  InteractionManager
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {
  Cells,
  CellsTitle,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
} from "../../weui/index";
import Button from 'react-native-vector-icons/MaterialCommunityIcons';

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

// create a component
class PrinterConnectScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;

    return {
      headerTitle: (
        <View>
          <Text style={{color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'}}>连接蓝牙打印机</Text>
        </View>
      ),
      headerStyle: {backgroundColor: colors.back_color, height: pxToDp(78)},
      headerRight: '',
    }
  };

  constructor(props: Object) {
    super(props);

    this.state = {
      isRefreshing: false,
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.setState({isRefreshing: false});
  }

  render() {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => this.onHeaderRefresh()}
            tintColor='gray'
          />
        }
        style={{backgroundColor: colors.main_back}}
      >
        <CellsTitle style={styles.cell_title}>蓝牙设备</CellsTitle>
        <Cells style={[styles.cells, styles.border_top]}>
          <Cell style={[styles.printer_box]} customStyle={{paddingRight: 0,}}>
            <CellBody>
              <Text style={[styles.printer_name]}>惠普打印机(H3250)</Text>
              <Text style={[styles.printer_number]}>98:9e:63:FD:Bf</Text>
            </CellBody>
            <CellFooter>
              <TouchableOpacity
                style={styles.right_box}
                onPress={() => {
                }}
              >
                <Button name='link' style={[styles.link_btn, styles.link_status_ok]}/>
                <Text style={[styles.link_status, styles.link_status_ok]}>已连接</Text>
              </TouchableOpacity>
            </CellFooter>
          </Cell>
          <Cell style={[styles.printer_box]} customStyle={{paddingRight: 0,}}>
            <CellBody>
              <Text style={[styles.printer_name]}>未知设备</Text>
              <Text style={[styles.printer_number]}>32:9f:33:09:EL</Text>
            </CellBody>
            <CellFooter>
              <TouchableOpacity
                style={styles.right_box}
                onPress={() => {
                }}
              >
                <Button name='link' style={styles.link_btn}/>
                <Text style={styles.link_status}>未连接</Text>
              </TouchableOpacity>
            </CellFooter>
          </Cell>
        </Cells>
      </ScrollView>
    );
  }

}

// define your styles
const styles = StyleSheet.create({
  cell_title: {
    marginBottom: pxToDp(5),
    fontSize: pxToDp(26),
    color: colors.color999,
  },
  cells: {
    marginTop: 0,
  },
  border_top: {
    borderTopWidth: pxToDp(1),
    borderTopColor: colors.color999,
  },
  printer_box: {
    borderBottomColor: colors.color999,
    borderBottomWidth: pxToDp(1),
    height: pxToDp(100),
    justifyContent: 'center',
  },
  printer_name: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color333,
  },
  printer_number: {
    fontSize: pxToDp(24),
    fontWeight: 'bold',
    color: colors.color999,
  },
  right_box: {
    width: pxToDp(120),
    height: '100%',
  },
  link_status_ok: {
    color: colors.main_color,
  },
  link_btn: {
    fontSize: pxToDp(50),
    lineHeight: pxToDp(40),
    fontWeight: 'bold',
    color: colors.color999,
    textAlign: 'center',
  },
  link_status: {
    fontSize: pxToDp(24),
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.color999,
  },
});

//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(PrinterConnectScene)
