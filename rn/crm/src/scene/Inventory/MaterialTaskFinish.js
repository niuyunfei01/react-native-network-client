import React from "react";
import native from "../../common/native";
import NavigationItem from "../../widget/NavigationItem";
import LoadMore from "react-native-loadmore";
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import HttpUtils from "../../util/http";
import WorkerPopup from "../component/WorkerPopup";
import pxToDp from "../../util/pxToDp";
import GlobalUtil from "../../util/GlobalUtil";
import moment from "moment";
import JbbDateRangeDialog from "../component/JbbDateRangeDialog";
import {tool} from "../../common";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class MaterialTaskFinish extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '我完成的任务',
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
    this.state = {
      tasks: [],
      page: 1,
      userId: null,
      start: null,
      end: null,
      username: '',
      isLastPage: false,
      isLoading: false,
      workerPopup: false
    }
  }
  
  componentDidMount (): void {
    const self = this
    const {params = {}} = self.props.navigation.state
    console.log(params)
    
    const data = {
      userId: params.uid ? params.uid : null,
      username: params.name ? params.name : null,
      start: params.start ? params.start : moment().format('YYYY-MM-DD'),
      end: params.end ? params.end : moment().add(1, 'days').format('YYYY-MM-DD'),
    }
    
    if (!data.userId) {
      GlobalUtil.getUser().then(user => {
        data.userId = user.id
        data.username = user.screen_name
        self.setState(data, () => this.fetchData())
      })
    } else {
      self.setState(data, () => this.fetchData())
    }
  }
  
  fetchData () {
    const self = this
    const navigation = this.props.navigation
    const accessToken = this.props.global.accessToken
    const api = `/api_products/material_task_finished?access_token=${accessToken}`
    self.setState({isLoading: true})
    HttpUtils.get.bind(self.props)(api, {
      page: this.state.page,
      userId: this.state.userId,
      start: this.state.start,
      end: this.state.end
    }).then(res => {
      let lists = res.page == 1 ? res.lists : this.state.tasks.concat(res.lists)
      self.setState({tasks: lists, isLoading: false, isLastPage: res.isLastPage, page: res.page + 1})
    })
  }
  
  onSwitchUser (user) {
    this.setState({page: 1, userId: user.id, username: user.name, workerPopup: false}, () => {
      this.onRefresh()
    })
  }
  
  onRefresh () {
    this.setState({page: 1}, () => {
      this.fetchData()
    })
  }
  
  renderFilterRow () {
    const self = this
    return (
      <View style={styles.filterRow}>
        <TouchableOpacity onPress={() => this.setState({workerPopup: true})} style={{flexDirection: 'row'}}>
          <Image
            source={require('../../img/switch.png')}
            style={[styles.filterImage, {marginRight: pxToDp(10)}]}
          />
          
          <Text style={styles.filterText}>{this.state.username}</Text>
        </TouchableOpacity>
        <JbbDateRangeDialog
          start={this.state.start}
          end={this.state.end}
          childrenTouchableStyle={{flexDirection: 'row'}}
          onConfirm={({start, end}) => self.setState({start, end}, () => this.onRefresh())}
        >
          <Text style={styles.filterText}>{this.state.start} ~ {this.state.end}</Text>
          
          <Image
            source={require('../../img/calendar.png')}
            style={[styles.filterImage, {marginLeft: pxToDp(10)}]}
          />
        </JbbDateRangeDialog>
      </View>
    )
  }
  
  renderItem (item, idx) {
    return (
        <View style={styles.item} key={idx}>
          <View style={{height: 20}}>
            <Text style={{color: '#000', fontWeight: 'bold'}}>{item.date}</Text>
          </View>
          <View style={{height: 30, flexDirection: 'row', alignItems: 'flex-end'}}>
            <Text style={{color: '#000', fontWeight: 'bold', fontSize: 15}}>{item.sku.name}</Text>
            <Text style={{fontSize: 12}}>(秤签：#{item.sku.material_code}；总货重{item.weight}公斤)</Text>
          </View>
          <For each='entry' of={item.entries} index='entryIdx'>
            <View style={styles.entryItem} key={entryIdx}>
              <Text style={{fontSize: 12, flex: 1}}>{entry.product.name}</Text>
              <Text style={{fontSize: 12, width: 80, textAlign: 'left'}}>
                {entry.pack_user.nickname} {entry.num > 0 ? `+${entry.num}` : entry.num}份
              </Text>
              <Text style={{fontSize: 12, width: 60, textAlign: 'right'}}>{entry.score}工分</Text>
            </View>
          </For>
          <If condition={item.type == 1 && item.status == 2 && item.sku && item.sku.need_pack == 1}>
            <View style={[styles.itemLine]}>
              <Text style={styles.itemText}>
                {`打包重量：${item.pack_weight}公斤 | `}
                {`损耗：${item.pack_loss}公斤 | `}
                <Text style={item.pack_loss_warning ? {color: '#e94f4f'} : ''}>
                  {`损耗率：${tool.toFixed(item.pack_loss_percent, 'percent')}`}
                </Text>
              </Text>
            </View>
          </If>
        </View>
    )
  }
  
  renderList () {
    return (
      <For each='item' of={this.state.tasks} index='idx'>
        {this.renderItem(item, idx)}
      </For>
    )
  }
  
  render () {
    return (
      <View style={{flex: 1}}>
        {this.renderFilterRow()}
    
        <LoadMore
          style={{marginBottom: pxToDp(60)}}
          scrollViewStyle={{flex: 1}}
          onRefresh={() => this.onRefresh()}
          isLastPage={this.state.isLastPage}
          renderList={this.renderList()}
          isLoading={this.state.isLoading}
          onLoadMore={() => this.fetchData()}
          loadMoreType={'scroll'}
          bottomLoadDistance={pxToDp(60)}
        />
    
        <WorkerPopup
          multiple={false}
          visible={this.state.workerPopup}
          onClickWorker={(user) => this.onSwitchUser(user)}
          onCancel={() => this.setState({workerPopup: false})}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: pxToDp(15),
    height: pxToDp(60),
    borderBottomWidth: pxToDp(1),
    borderColor: '#333'
  },
  filterImage: {
    width: pxToDp(40),
    height: pxToDp(40)
  },
  filterText: {
    fontWeight: 'bold'
  },
  item: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  itemLine: {
    height: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 12,
  },
  entryItem: {
    flexDirection: 'row',
    width: '100%',
    height: 20
  }
})
export default connect(mapStateToProps)(MaterialTaskFinish)