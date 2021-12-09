import React from "react";
import LoadMore from "react-native-loadmore";
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import HttpUtils from "../../util/http";
import pxToDp from "../../util/pxToDp";
import GlobalUtil from "../../util/GlobalUtil";
import moment from "moment";
import JbbDateRangeDialog from "../component/JbbDateRangeDialog";
import {tool} from "../../common";
import ActiveWorkerPopup from "../component/ActiveWorkerPopup";
import ModalSelector from "react-native-modal-selector";
import color from '../../widget/color'

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

class MaterialTaskFinish extends React.Component {

  constructor(props) {
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
      workerPopup: false,
      summary: {},
      explainTypes: []
    }
  }

  componentDidMount() {
    const {params = {}} = this.props.route
    const accessToken = this.props.global.accessToken
    const api = `/api/is_sign_worker?access_token=${accessToken}`
    const data = {
      userId: this.props.global.currentUser ? this.props.global.currentUser : 0,
      username: params.name ? params.name : '全部',
      start: params.start ? params.start : moment().format('YYYY-MM-DD'),
      end: params.end ? params.end : moment().format('YYYY-MM-DD'),
    }
    if (!data.userId) {
      HttpUtils.get.bind(this.props)(api, {}).then(res => {
        //本店签到人员且非(店长、助理店长、运营人员)
        if (res) {
          GlobalUtil.getUser().then(user => {
            data.userId = user.id
            data.username = user.screen_name
            this.setState(data, () => this.onRefresh())
          })
        } else {
          this.setState(data, () => this.onRefresh())
        }
      })
    } else {
      this.setState(data, () => this.onRefresh())
    }

    this.fetchExplainType()
  }

  fetchData() {
    const self = this
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

  fetchSummaryData() {
    const accessToken = this.props.global.accessToken
    const api = `/api_products/material_task_finished_summary?access_token=${accessToken}`
    this.setState({isLoading: true})
    HttpUtils.get.bind(this.props)(api, {
      userId: this.state.userId,
      start: this.state.start,
      end: this.state.end
    }).then(res => {
      if (res) {
        this.setState({summary: res})
      }
    })
  }

  fetchExplainType() {
    const self = this
    const accessToken = this.props.global.accessToken
    const api = `/api_products/pack_loss_explain_types?access_token=${accessToken}`
    self.setState({isLoading: true})
    HttpUtils.get.bind(self.props)(api).then(res => {
      self.setState({explainTypes: res})
    })
  }

  onSwitchUser(user) {
    this.setState({page: 1, userId: user.id, username: user.name, workerPopup: false}, () => {
      this.onRefresh()
    })
  }

  onRefresh() {
    this.setState({page: 1}, () => {
      this.fetchData()
      this.fetchSummaryData()
    })
  }

  addExplain(receipt, explain) {
    const self = this
    const accessToken = this.props.global.accessToken
    const api = `/api_products/add_loss_explain?access_token=${accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      receiptId: receipt.id,
      type: explain.value
    }).then(res => {

    })
  }

  renderFilterRow() {
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

  renderSummary() {
    const {summary} = this.state
    return (
      <View style={styles.summary}>
        <Text>
          总损耗：{summary.loss_price}元({tool.toFixed(summary.loss_price_percent, 'percent')})
          总工分：{summary.total_score}
        </Text>
      </View>
    )
  }

  renderItem(item, idx) {
    return (
      <View style={styles.item} key={idx}>
        <View style={{height: 20}}>
          <Text style={{color: '#000', fontWeight: 'bold'}}>{item.date}</Text>
        </View>
        <View style={{height: 30, flexDirection: 'row', alignItems: 'flex-end'}}>
          <Text style={{color: '#000', fontWeight: 'bold', fontSize: 15}}>{item.sku.name}</Text>
          <Text style={{fontSize: 12}}>
            (秤签：#{item.sku.material_code})
          </Text>
        </View>
        <For each='entry' of={item.entries} index='entryIdx'>
          <View style={styles.entryItem} key={entryIdx}>
            <Text style={{fontSize: 12, flex: 1}}>{entry.product.name}</Text>
            <Text style={{fontSize: 12, width: 80, textAlign: 'left'}}>
              {entry.pack_user.nickname} {entry.num > 0 ? `+${entry.num}` : entry.num}份
            </Text>
            <Text style={[{
              fontSize: 12,
              width: 60,
              textAlign: 'right'
            }, item.pack_loss_warning ? {
              textDecorationLine: 'line-through',
              textDecorationColor: '#e94f4f'
            } : null]}>{entry.score}工分</Text>
          </View>
        </For>
        <View style={[styles.itemLine]}>
          <Text style={styles.itemText}>
            总货重{item.weight}公斤 | 打包重量：{item.pack_weight}公斤
          </Text>
        </View>
        <View style={[styles.itemLine]}>
          <Text style={styles.itemText}>
            {`损耗：${item.pack_loss_weight}公斤 | ${item.pack_loss_price}元 | `}
            <Text style={item.pack_loss_warning ? {color: '#e94f4f'} : ''}>
              {`损耗率：${tool.toFixed(item.pack_loss_percent, 'percent')}`}
            </Text>
          </Text>
        </View>
        <If condition={item.pack_loss_warning}>
          <View style={styles.explainWrap}>
            <Text style={styles.itemText}>损耗原因：</Text>
            <ModalSelector
              style={[{flex: 1}]}
              touchableStyle={[{width: '100%', flex: 1}]}
              childrenContainerStyle={[{width: '100%', flex: 1}]}
              onChange={(option) => this.addExplain(item, option)}
              cancelText={'取消'}
              data={this.state.explainTypes}
            >
              <Text style={[styles.itemText, {color: color.theme}]}>添加解释</Text>
            </ModalSelector>
          </View>
          <For each='explain' index='explainIdx' of={item.explains}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', flex: 1}}>
              <Text style={{fontSize: 12}}>{explain.user.nickname}：{explain.label}</Text>
              <Text style={{fontSize: 12}}>{explain.created}</Text>
            </View>
          </For>
        </If>
      </View>
    )
  }

  renderList() {
    return (
      <For each='item' of={this.state.tasks} index='idx'>
        {this.renderItem(item, idx)}
      </For>
    )
  }

  render() {
    return (
      <View style={{flex: 1}}>
        {this.renderFilterRow()}
        {this.renderSummary()}
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

        <ActiveWorkerPopup
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
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: pxToDp(15),
    height: pxToDp(60),
    borderBottomWidth: pxToDp(1),
    borderColor: '#666'
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
    alignItems: 'flex-end',
    width: '100%',
    height: 20
  },
  explainWrap: {
    flex: 1,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#efefef'
  }
})
export default connect(mapStateToProps)(MaterialTaskFinish)
