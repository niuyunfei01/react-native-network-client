//import liraries
import React, {PureComponent} from 'react'
import {Dimensions, Image, InteractionManager, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import {Cell, CellBody, CellFooter, CellHeader, Cells, CellsTitle,} from "../../../weui";
import Icon from 'react-native-vector-icons/MaterialIcons';
import {connect} from "react-redux";
import Config from "../../../pubilc/common/config";
import Button from 'react-native-vector-icons/Entypo';
import CallBtn from "../../order/CallBtn";
import Loadmore from 'react-native-loadmore'
import FetchEx from "../../../pubilc/util/fetchEx";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}

class WorkerScene extends PureComponent {

  constructor(props) {
    super(props);
    const {
      currentUser,
      currStoreId,
      canReadStores,
    } = this.props.global;

    let currVendorId = canReadStores[currStoreId]['type'];
    let currVendorName = canReadStores[currStoreId]['vendor'];
    this.state = {
      currentUser: currentUser,
      currVendorId: currVendorId,
      currVendorName: currVendorName,
      lists: [],
      pageNum: 1,
      pageSize: 20,
      isLastPage: false,
      filterName: '',
      isLoading: false
    }
  }

  UNSAFE_componentWillMount() {
    this.fetchData()
  }

  componentDidMount() {
  }

  onPress(route, params = {}) {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  renderUser(user, idx) {
    return (
      <Cell customStyle={[styles.cell_row]} key={idx}>
        <CellHeader>
          <Image
            style={[styles.worker_img]}
            source={user.image !== '' ? {uri: user.image} : require('../../../img/My/touxiang50x50_.png')}
          />
        </CellHeader>
        <CellBody>
          <Text style={[styles.worker_name]}>{user.name}({user.id}) </Text>
          <CallBtn style={[styles.worker_tel]} mobile={user.mobile ? user.mobile : user.user.mobilephone}/>
        </CellBody>
        <CellFooter>
          <TouchableOpacity
            onPress={() => {
              this.onPress(Config.ROUTE_USER, {
                type: 'worker',
                currentUser: user.id,
                worker_id: user.worker_id,
                navigation_key: this.props.route.key,
                store_id: parseInt(user.store_id),
                currVendorId: this.state.currVendorId,
                mobile: user.mobilephone,
                cover_image: user.image,
                user_name: user.nickname,
                user_status: parseInt(user.status),
              })
            }}
          >
            <Button name='chevron-right' style={styles.right_btn}/>
          </TouchableOpacity>
        </CellFooter>
      </Cell>
    );
  }

  renderList() {
    let _this = this
    const {lists} = _this.state
    let items = []
    for (let i in lists) {
      if (lists[i]) {
        items.push(_this.renderUser(lists[i], i))
      }
    }
    return items
  }

  fetchData(options = {}) {
    const self = this
    const {global} = this.props
    const {pageNum, pageSize, currVendorId} = this.state
    let token = global['accessToken']
    const url = `/api/worker_list?access_token=${token}`;
    this.setState({isLoading: true});
    FetchEx.timeout(Config.FetchTimeout, FetchEx.postJSON(url, {
      vendorId: currVendorId,
      name: self.state.filterName,
      page: options.pageNum ? options.pageNum : pageNum,
      pageSize: pageSize
    })).then(resp => resp.json()).then(resp => {
      this.setState({isLoading: false});
      let {ok, reason, obj, error_code} = resp;
      if (ok) {
        let isLastPage = true
        if (obj.lists.length && obj.page * obj.pageSize < obj.count) {
          isLastPage = false
        }

        let lists = obj.lists
        if (obj.page != 1) {
          lists = this.state.lists.concat(lists)
        }
        self.setState({
          lists: lists,
          pageNum: obj.page + 1,
          pageSize: obj.pageSize,
          isLastPage: isLastPage,
        })
      }
    })
  }

  render() {
    return (
      <View>
        <View>
          <CellsTitle style={styles.cell_title}>新增员工</CellsTitle>
          <Cells style={[styles.cells]}>
            <Cell
              customStyle={[styles.cell_row]}
              onPress={() => {
                this.onPress(Config.ROUTE_USER_ADD, {
                  type: 'add',
                })
              }}
            >
              <CellHeader>
                <Icon name="person-add" style={[styles.add_user_icon]}/>
              </CellHeader>
              <CellBody>
                <Text style={[styles.worker_name]}>新增员工</Text>
              </CellBody>
              <CellFooter>
                <Button name='chevron-right' style={styles.right_btn}/>
              </CellFooter>
            </Cell>
          </Cells>
        </View>

        <View style={styles.searchBox}>
          <FontAwesome5 name={'search'} style={{fontSize: 26}}/>
          <TextInput
            underlineColorAndroid='transparent'
            placeholder='搜索员工'
            placeholderTextColor='#999'
            selectionColor='#ff4f39'
            style={styles.inputText}
            onChangeText={(text) => {
              this.setState({filterName: text}, () => {
                this.fetchData({pageNum: 1})
              })
            }}
          />
        </View>

        <View style={{paddingBottom: pxToDp(500)}}>
          <Loadmore
            renderList={this.renderList()}
            onLoadMore={() => {
              this.fetchData()
            }}
            isLoading={this.state.isLoading}
            onRefresh={() => {
              this.fetchData({pageNum: 1})
            }}
            loadMoreType={"scroll"}
            isLastPage={this.state.isLastPage}
          />
        </View>
      </View>
    );
  }
}


// define your styles
const {height, width} = Dimensions.get('window')
const styles = StyleSheet.create({
  cell_title: {
    marginBottom: pxToDp(5),
    fontSize: pxToDp(26),
    color: colors.color999,
  },
  cells: {
    marginTop: 0,
    paddingLeft: 0,
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.color999,
  },
  cell_row: {
    height: pxToDp(90),
    justifyContent: 'center',
    marginLeft: 0,
    paddingLeft: pxToDp(30),
    paddingRight: 0,
  },
  worker_img: {
    width: pxToDp(50),
    height: pxToDp(50),
    marginVertical: pxToDp(20),
    borderRadius: 50,
  },
  worker_name: {
    fontSize: pxToDp(28),
    fontWeight: 'bold',
    color: colors.color333,
  },
  worker_tel: {
    fontSize: pxToDp(22),
    fontWeight: 'bold',
    color: colors.color999,
  },
  add_user_icon: {
    marginRight: pxToDp(10),
    fontSize: pxToDp(50),
    color: '#449af8',
  },
  right_btn: {
    fontSize: pxToDp(30),
    textAlign: 'center',
    width: pxToDp(90),
    height: pxToDp(70),
    color: colors.color999,
    paddingTop: pxToDp(20),
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 5,
    height: 30,
    marginTop: pxToDp(5),
    marginBottom: pxToDp(5)
  },
  searchImg: {
    marginLeft: 15,
    marginRight: 10,
    width: pxToDp(50),
    height: pxToDp(50)
  },
  inputText: {
    flex: 1,
    padding: 0,
  },
});


//make this component available to the app
// export default WorkerScene;
export default connect(mapStateToProps)(WorkerScene)
