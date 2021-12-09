import {RefreshControl, ScrollView, Text, View} from 'react-native'
import React, {PureComponent} from 'react'
import {connect} from "react-redux"
import {bindActionCreators} from "redux"
import {Button, List, SwipeAction} from '@ant-design/react-native';
import * as globalActions from "../../reducers/global/globalActions"

const mapStateToProps = state => {
  let {global} = state
  return {global: global}
}

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}

class PlatformScene extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      isRefreshing: false,
      platformsList: [],
      dialogVisible: false,
      developerId: '',
      businessId: '',
      sign: '',
      timestamp: ''
    }
    this.queryPlatformList = this.queryPlatformList.bind(this)
  }

  componentDidMount() {
    this.queryPlatformList();
  }

  queryPlatformList() {
    this.setState({isRefreshing: true})
    this.props.actions.platformList(this.props.global.currStoreId, (success, response) => {
      this.setState({platformsList: response})
      this.setState({isRefreshing: false})
    })
  }


  render() {

    const records = this.state.platformsList;
    return (
      <ScrollView
        style={{flex: 1, backgroundColor: '#f5f5f9'}}
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => this.queryPlatformList()}
            tintColor='gray'
          />
        }
        automaticallyAdjustContentInsets={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <List>
          {records && records.map((item, id) => {
            return <SwipeAction
              autoClose
              style={{backgroundColor: 'transparent'}}
              right={[
                {
                  text: '设置配送',
                  onPress: () => {
                    this.props.navigation.navigate(
                      'SeetingDelivery',
                      {
                        ext_store_id: item.id,
                        store_id: item.store_id,
                        poi_name: item.poi_name,
                      }
                    )
                  },
                  style: {backgroundColor: 'blue', color: 'white'},

                },
                {
                  text: '删除',
                  onPress: () => {
                    this.props.actions.unBind({}, (success) => {
                    })
                  },
                  style: {backgroundColor: 'red', color: 'white'},
                },

              ]}
            >
              <List.Item thumb={item.img}>
                {item.poi_name}
                <List.Item.Brief>{item.wid}</List.Item.Brief>
              </List.Item>
            </SwipeAction>
          })}
        </List>
        {!records.length ? <View><Text style={{
          flex: 1,
          marginTop: 30,
          backgroundColor: '#f5f5f9',
          textAlignVertical: "center",
          textAlign: "center",
          fontWeight: 'bold',
          fontSize: 25
        }}>您还没有绑定任何平台，
        </Text><Text style={{
          flex: 1,
          marginTop: 5,
          backgroundColor: '#f5f5f9',
          textAlignVertical: "center",
          textAlign: "center",
          fontWeight: 'bold',
          fontSize: 25
        }}>绑定平台以后方可使用。</Text></View> : null}
        <Button
          onPress={() => {
            this.props.navigation.navigate('PlatformBind', {onGoBack: () => this.queryPlatformList()})
          }}
          style={{
            backgroundColor: '#f5f5f9',
            textAlignVertical: "center",
            textAlign: "center", marginTop: 30
          }}>添加平台信息</Button>
      </ScrollView>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlatformScene)
