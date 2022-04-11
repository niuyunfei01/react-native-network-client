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

class UserTagPopup extends React.Component {

  static propTypes = {
    visible: PropType.bool.isRequired,
    animationType: PropType.oneOf(['slide', 'fade', 'none']),
    multiple: PropType.bool,
    onModalClose: PropType.func,
    onClickTag: PropType.func,
    onCancel: PropType.func,
    onComplete: PropType.func,
    selectTagIds: PropType.array
  }

  static defaultProps = {
    visible: true,
    animationType: 'slide',
    multiple: true,
    onModalClose: () => {
    },
    selectTagIds: []
  }

  constructor(props) {
    super(props)
    this.state = {
      originTagList: [],
      tagList: [],
      selectTags: []
    }
  }

  componentDidMount() {
    this.fetchTagList()
    this.setSelectTags()
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setSelectTags()
  }

  fetchTagList() {
    const self = this
    ToastLong('数据请求中')
    let {currVendorId} = tool.vendor(this.props.global);
    const {accessToken} = this.props.global;
    const url = `DataDictionary/user_tags/${currVendorId}?access_token=${accessToken}`;

    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          if (resp.ok) {
            let tagList = resp.obj
            let list = []
            if (tagList && tagList.length > 0) {
              tagList.forEach(function (item) {
                list.push({name: item['name'], id: item['id']});
              });
            }
            self.setState({originTagList: list, tagList: list})
          }
        })
        .catch(e => {
        })
  }

  setSelectTags() {
    let selectTags = []
    let initTagIds = this.props.selectTagIds
    let tagList = this.state.originTagList
    if (tagList && tagList.length > 0) {
      tagList.forEach(function (item) {
        if (initTagIds.includes(item.id)) {
          selectTags.push({name: item.name, id: item.id})
        }
      });
    }
    this.setState({selectTags})
  }

  onSelectTag(item) {
    let selectTags = this.state.selectTags
    for (let i in selectTags) {
      if (selectTags[i].id === item.id) {
        selectTags.splice(i, 1)
        this.setState({selectTags})
        return
      }
    }
    selectTags.push(item)
    this.setState({selectTags})
  }

  onClickTag(item) {
    this.props.onClickTag && this.props.onClickTag(item)
  }

  onComplete() {
    this.props.onComplete && this.props.onComplete(this.state.selectTags)
  }

  onCancel() {
    this.props.onCancel && this.props.onCancel()
  }

  onSearch(value) {
    const originTagList = this.state.originTagList
    let tagList = originTagList.filter(this.createFilter(value))
    this.setState({tagList})
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
    const tagList = this.state.tagList
    let elements = []
    for (let item of tagList) {
      elements.push(
          <CheckboxItem
              key={`checkbox_${item.id}`}
              onChange={() => self.onSelectTag(item)}
              defaultChecked={this.props.selectTagIds.includes(item.id)}
          >
            {item.name}
          </CheckboxItem>
      )
    }
    return elements
  }

  renderListItem() {
    const self = this
    const tagList = this.state.tagList
    let elements = []
    for (let item of tagList) {
      elements.push(
          <ListItem key={`radio_${item.id}`} onClick={() => self.onClickTag(item)}>
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
            <Text style={[styles.headerBtn]}>确定</Text>
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
          <Text style={[styles.headerTitle]}>标签列表</Text>
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
            <SearchBar placeholder="请输入名称" onChange={(value) => this.onSearch(value)}/>
            {this.state.tagList.length > 0 ? <ScrollView>
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

export default withNavigation(connect(mapStateToProps)(UserTagPopup))
