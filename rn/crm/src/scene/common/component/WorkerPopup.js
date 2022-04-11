import React from 'react'
import PropType from 'prop-types'
import {Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {Checkbox, List, SearchBar} from "@ant-design/react-native";
import {connect} from "react-redux";
import * as tool from "../../../pubilc/util/tool";
import pxToDp from "../../../pubilc/util/pxToDp";
import {withNavigation} from '@react-navigation/compat';
import FetchEx from "../../../pubilc/util/fetchEx";
import AppConfig from "../../../pubilc/common/config";
import {ToastLong} from "../../../pubilc/util/ToastUtils";


const ListItem = List.Item
const CheckboxItem = Checkbox.CheckboxItem

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global};
}

class WorkerPopup extends React.Component {

  static propTypes = {
    visible: PropType.bool.isRequired,
    animationType: PropType.oneOf(['slide', 'fade', 'none']),
    multiple: PropType.bool,
    onModalClose: PropType.func,
    onClickWorker: PropType.func,
    onCancel: PropType.func,
    onComplete: PropType.func,
    selectWorkerIds: PropType.array
  }

  static defaultProps = {
    visible: true,
    animationType: 'slide',
    multiple: true,
    onModalClose: () => {
    },
    selectWorkerIds: []
  }

  constructor(props) {
    super(props)
    this.state = {
      originWorkerList: [],
      workerList: [],
      selectWorkers: [],
      initSelectedWorkers: []
    }
  }

  componentDidMount() {
    this.fetchWorkerList()
    this.setSelectWorkers()
  }

  fetchWorkerList() {
    const self = this
    ToastLong('数据请求中');
    let {currVendorId} = tool.vendor(this.props.global);
    const {accessToken} = this.props.global;
    const url = `DataDictionary/worker_list/${currVendorId}?access_token=${accessToken}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          if (resp.ok) {
            let workerList = resp.obj;
            let list = [];
            list.push({name: '不任命任何人', id: '0'});
            if (workerList && workerList.length > 0) {
              workerList.forEach(function (item) {
                const user = item['user'];
                list.push({name: `${user['nickname']}-${user['mobilephone']}`, id: user['id']});
              });
            }
            self.setState({originWorkerList: list, workerList: list})
          }
        })
        .catch(e => {
        })
  }

  setSelectWorkers() {
    let selectWorkers = []
    for (let o of this.props.selectWorkerIds) {
      selectWorkers.push({id: o})
    }
    this.setState({selectWorkers})
  }

  onSelectWorker(item) {
    let selectWorkers = this.state.selectWorkers
    for (let i in selectWorkers) {
      if (selectWorkers[i].id === item.id) {
        selectWorkers.splice(i, 1)
        this.setState({selectWorkers})
        return
      }
    }

    selectWorkers.push(item)
    this.setState({selectWorkers})
  }

  onClickWorker(item) {
    this.props.onClickWorker && this.props.onClickWorker(item)
  }

  onComplete() {
    this.props.onComplete && this.props.onComplete(this.state.selectWorkers)
  }

  onCancel() {
    this.props.onCancel && this.props.onCancel()
  }

  onSearch(value) {
    const originWorkerList = this.state.originWorkerList
    let workerList = originWorkerList.filter(this.createFilter(value))
    this.setState({workerList})
  }

  createFilter(value) {
    return (worker) => {
      if (worker && worker.name) {
        return worker.name.toLowerCase().indexOf(value.toLowerCase()) >= 0
      }
      return false;
    }
  }

  renderCheckboxItem = () => {
    const self = this
    const workerList = this.state.workerList
    let elements = []
    for (let item of workerList) {
      elements.push(
          <CheckboxItem
              key={`checkbox_${item.id}`}
              onChange={() => self.onSelectWorker(item)}
              defaultChecked={this.props.selectWorkerIds.includes(item.id)}
          >
            {item.name}
          </CheckboxItem>
      )
    }
    return elements
  }

  renderListItem() {
    const self = this
    const workerList = this.state.workerList
    let elements = []
    for (let item of workerList) {
      elements.push(
          <ListItem key={`radio_${item.id}`} onClick={() => self.onClickWorker(item)}>
            {item.name}
          </ListItem>
      )
    }
    return elements
  }

  renderHeaderCompleteBtn() {
    return (
        <TouchableOpacity onPress={() => this.onComplete()}>
          <View style={[styles.headerBtnView]}>
            <Text style={[styles.headerBtn]}>确定 </Text>
          </View>
        </TouchableOpacity>
    )
  }

  renderHeader() {
    return (
        <View style={[styles.header]}>
          <TouchableOpacity onPress={() => this.onCancel()}>
            <View style={[styles.headerBtnView]}>
              <Text style={[styles.headerBtn]}>
                取消
              </Text>
            </View>
          </TouchableOpacity>
          <Text style={[styles.headerTitle]}>员工列表 </Text>
          {this.props.multiple ? this.renderHeaderCompleteBtn() : <View style={[styles.headerBtnView]}/>}
        </View>
    )
  }

  render() {
    return (
        <Modal
            presentationStyle={'fullScreen'}
            hardwareAccelerated={true}
            visible={this.props.visible}
            onRequestClose={() => this.props.onModalClose()}
        >
          <View style={[styles.workerPopup]}>
            {this.renderHeader()}
            <SearchBar placeholder="请输入姓名" onChange={(value) => this.onSearch(value)}/>
            {this.state.workerList.length > 0 ? <ScrollView>
                  <List>
                    {this.props.multiple ? this.renderCheckboxItem() : this.renderListItem()}
                  </List>
                </ScrollView> :
                <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}><Text>无数据！</Text></View>}
          </View>
        </Modal>
    )
  }
}

const styles = StyleSheet.create({
  workerPopup: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    height: pxToDp(80),
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: pxToDp(36)
  },
  headerBtnView: {
    width: pxToDp(80),
    alignItems: 'center'
  },
  headerBtn: {
    color: '#108ee9'
  },
  bottomBtnView: {
    alignItems: 'center',
    justifyContent: 'center',
    height: pxToDp(100),
    borderTopWidth: pxToDp(1),
    borderStyle: 'solid'
  }
})

export default withNavigation(connect(mapStateToProps)(WorkerPopup))
