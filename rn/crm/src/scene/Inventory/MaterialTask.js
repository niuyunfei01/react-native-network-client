import React from "react";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import config from '../../config'
import native from "../../common/native";
import NavigationItem from "../../widget/NavigationItem";
import {connect} from "react-redux";
import {List, Toast} from "antd-mobile-rn";
import HttpUtils from "../../util/http";
import JbbButton from "../component/JbbButton";
import JbbInput from "../component/JbbInput";
import {tool} from "../../common";
import Swipeout from 'react-native-swipeout';
import WorkerPopup from "../component/WorkerPopup";

const ListItem = List.Item
const ListItemBrief = ListItem.Brief

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class MaterialTask extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '任务中心',
      headerLeft: (
        <NavigationItem
          icon={require("../../img/Register/back_.png")}
          onPress={() => native.nativeBack()}
        />
      )
    }
  }
  
  constructor (props) {
    super(props)
    const vendor = tool.vendor(this.props.global);
    const store = tool.store(this.props.global)
    const {is_service_mgr = false} = vendor
    this.state = {
      is_service_mgr: is_service_mgr,
      storeId: store.id,
      packingTask: [],
      pendingTask: [],
      selectRow: {},
      workerPopup: false
    }
  }
  
  componentWillMount (): void {
    this.fetchData()
  }
  
  fetchData () {
    const self = this
    const navigation = this.props.navigation
    const accessToken = this.props.global.accessToken
    const api = `/api_products/material_task?access_token=${accessToken}`
    HttpUtils.get.bind(navigation)(api, {storeId: this.state.storeId}).then(res => {
      self.setState({packingTask: res.packing, pendingTask: res.pending}, () => self.forceUpdate())
    })
  }
  
  getTask () {
    const self = this
    const navigation = this.props.navigation
    const accessToken = this.props.global.accessToken
    const api = `/api_products/material_get_task?access_token=${accessToken}`
    HttpUtils.get.bind(navigation)(api).then(res => {
      self.fetchData()
    })
  }
  
  onPickUp (item, isFinish) {
    const self = this
    const navigation = this.props.navigation
    const accessToken = this.props.global.accessToken
    const api = `/api_products/inventory_entry/${item.id}?access_token=${accessToken}`
    HttpUtils.post.bind(navigation)(api, {
      task: item.task,
      isFinish: isFinish
    }).then(res => {
      Toast.success('操作成功')
      self.fetchData()
    })
  }
  
  onAssignTask (user) {
    const self = this
    const navigation = this.props.navigation
    const accessToken = this.props.global.accessToken
    const api = `/api_products/material_assign_task?access_token=${accessToken}`
    HttpUtils.post.bind(navigation)(api, {
      receiptId: this.state.selectRow.id,
      userId: user.id
    }).then(res => {
      Toast.success('操作成功')
      self.setState({selectRow: {}, workerPopup: false})
      self.fetchData()
    })
  }
  
  setProductNum (task, idx, taskIdx, value) {
    let pack = this.state.packingTask
    task.num = value
    pack[idx]['task'][taskIdx] = task
    this.setState({packingTask: pack})
  }
  
  renderPackingTask () {
    console.log('render packing task => ', JSON.parse(JSON.stringify(this.state.packingTask)))
    return (
      <For each='item' of={this.state.packingTask} index='idx'>
        <View style={styles.item} key={idx}>
          <View style={styles.taskTitle}>
            <Text style={{color: '#000', fontWeight: 'bold', fontSize: 15}}>
              {item.sku.name}({item.sku.material_code})
            </Text>
            <Text style={{color: '#000', fontWeight: 'bold'}}>{`${item.weight}公斤`}</Text>
          </View>
          <For each="task" of={item.task} index="taskIdx">
            <View style={styles.taskItem} key={taskIdx}>
              <Text style={{fontSize: 12, flex: 1}}>[{task.shelf_no}]{task.product_name}</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', width: 100}}>
                <JbbInput
                  ref={`taskInput_${task.product_id}`}
                  onChange={(value) => this.setProductNum(task, idx, taskIdx, value)}
                  value={task.num}
                  initValue={''}
                  styles={styles.taskInput}
                />
                <Text style={{textAlign: 'right'}}>份</Text>
              </View>
              <Text style={{fontSize: 12, width: 40, textAlign: 'right'}}>0工分</Text>
            </View>
          </For>
          <View style={styles.taskBtn}>
            <JbbButton
              text={'入库'}
              onPress={() => this.onPickUp(item, false)}
              type={'hollow'}
              fontSize={12}
            />
            <JbbButton
              text={'完成'}
              onPress={() => this.onPickUp(item, true)}
              type={'default'}
              fontSize={12}
            />
          </View>
        </View>
      </For>
    )
  }
  
  renderItem (item, idx) {
    const swipeOutBtns = [
      {
        text: '指派',
        type: 'primary',
        onPress: () => this.setState({selectRow: item, workerPopup: true})
      }
    ]
    
    return (
      <Swipeout right={swipeOutBtns} autoClose={true} key={item.id} style={{flex: 1}}>
        <ListItem
          key={idx}
          extra={item.date}
        >
          {item.sku.name}
          <ListItemBrief>
            <Text style={{fontSize: 10}}>{`货重：${item.weight}公斤 扣重：${item.reduce_weight}公斤`}</Text>
          </ListItemBrief>
        </ListItem>
      </Swipeout>
    )
  }
  
  renderPendingTask () {
    return (
      <List renderHeader={`剩余待打包任务(${this.state.pendingTask.length}件)`}>
        <For of={this.state.pendingTask} each="item" index="idx">
          {this.renderItem(item, idx)}
        </For>
      </List>
    )
  }
  
  render () {
    return (
      <View style={{flex: 1}}>
        <ScrollView style={{flex: 1}}>
          {this.renderPackingTask()}
          
          <If condition={this.state.packingTask.length < 2}>
            <View style={styles.getTaskBtnWrap}>
              <TouchableOpacity onPress={() => this.getTask()}>
                <View>
                  <Text style={styles.getTaskBtn}>领取任务</Text>
                </View>
              </TouchableOpacity>
            </View>
          </If>
          
          {this.renderPendingTask()}
        </ScrollView>
        <TouchableOpacity onPress={() => this.props.navigation.navigate(config.ROUTE_INVENTORY_MATERIAL_TASK_FINISH)}>
          <View style={{height: 60, alignItems: 'center', justifyContent: 'center'}}>
            <Text>我完成的任务</Text>
          </View>
        </TouchableOpacity>
  
        <WorkerPopup
          multiple={false}
          visible={this.state.workerPopup}
          onCancel={() => this.setState({workerPopup: false})}
          onModalClose={() => this.setState({workerPopup: false})}
          onClickWorker={(user) => this.onAssignTask(user)}
        />
      </View>
    );
  }
}

export default connect(mapStateToProps)(MaterialTask)

const styles = StyleSheet.create({
  getTaskBtnWrap: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center'
  },
  getTaskBtn: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#000',
    color: '#000'
  },
  item: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 2
  },
  taskTitle: {
    height: 30,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between'
  },
  taskItem: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    height: 30,
    alignItems: 'center'
  },
  taskInput: {
    padding: 0,
    paddingLeft: 0,
    textAlign: 'center',
    width: 50,
    marginHorizontal: 0
  },
  taskBtn: {
    alignItems: 'center',
    width: '100%',
    height: 40,
    justifyContent: 'space-around',
    flexDirection: 'row'
  }
})