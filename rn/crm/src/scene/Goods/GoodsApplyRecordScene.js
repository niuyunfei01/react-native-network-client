import React, {Component} from "react";
import {FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import {fetchApplyRocordList} from "../../reducers/product/productActions";
import pxToDp from "../../util/pxToDp";
import colors from "../../widget/color";
import Cts from "../../Cts";
import Config from "../../config";

import LoadingView from "../../widget/LoadingView";
import {Dialog, Toast} from "../../weui/index";
import * as tool from "../../common/tool";
import {Button1} from "../component/All";
//请求
import {getWithTpl} from "../../util/common";
import {ToastLong} from "../../util/ToastUtils";
import {NavigationItem} from "../../widget";
import native from "../../common/native";

function mapStateToProps(state) {
  const {product, global} = state;
  return {product: product, global: global};
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        fetchApplyRocordList,
        ...globalActions
      },
      dispatch
    )
  };
}

class GoodsApplyRecordScene extends Component {
  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: `申请记录`,
      headerLeft: () => (
          <NavigationItem
              icon={require("../../img/Register/back_.png")}
              onPress={() => native.nativeBack()}
          />
      ),
    });
  }

  constructor(props) {
    super(props);
    const {is_service_mgr = false} = tool.vendor(this.props.global)
    this.state = {
      audit_status: Cts.AUDIT_STATUS_WAIT,
      list: [],
      query: true,
      pullLoading: false,
      total_page: 1,
      curr_page: 1,
      refresh: false,
      onSendingConfirm: true,
      dialog: false,
      isKf: is_service_mgr
    };
    this.tab = this.tab.bind(this);
    this.getApplyList = this.getApplyList.bind(this);

    this.navigationOptions(this.props)
  }

  UNSAFE_componentWillMount() {
    let {viewStoreId} = this.props.route.params;
    let storeId = this.props.global.currStoreId;
    if (viewStoreId) {
      storeId = viewStoreId;
    }
    this.setState({viewStoreId: storeId, refresh: true}, () => this.getApplyList(1));
  }

  tab(num) {
    if (num != this.state.audit_status) {
      this.setState({query: true, audit_status: num, list: [], refresh: true}, () => {
        this.getApplyList(1);
      });
    }
  }

  tips(msg) {
    this.setState({dialog: true, errMsg: msg});
  }

  getApplyList(page) {
    let pullLoading = this.state.pullLoading;
    if (pullLoading) {
      return false;
    }
    let store_id = this.state.viewStoreId;
    let audit_status = this.state.audit_status;
    let token = this.props.global.accessToken;
    const {dispatch} = this.props;
    dispatch(
      fetchApplyRocordList(store_id, audit_status, page, token, async resp => {
        if (resp.ok) {
          let {total_page, audit_list} = resp.obj;
          let arrList;
          if (this.state.refresh) {
            arrList = audit_list;
          } else {
            arrList = this.state.list.concat(audit_list);
          }
          this.setState({
            list: arrList,
            total_page: total_page,
            curr_page: page
          });
        } else {
          console.log(resp.desc);
        }
        this.setState({pullLoading: false, refresh: false, query: false});
      })
    );
  }

  renderTitle() {
    if (this.state.list.length > 0) {
      return (
        <View style={styles.title}>
          <Text style={[styles.title_text]}>图片</Text>
          <Text style={[styles.title_text, {width: pxToDp(240)}]}>
            商品名称
          </Text>
          <Text style={[styles.title_text, {width: pxToDp(120)}]}>
            原价
          </Text>
          <Text style={[styles.title_text, {width: pxToDp(120)}]}>
            调整价
          </Text>
        </View>
      );
    } else {
      return <View/>;
    }
  }

  renderList() {
    this.state.list.forEach((item, index) => {
      item.key = index;
    });
    return (
      <FlatList
        extraData={this.state}
        style={{flex: 1}}
        data={this.state.list}
        renderItem={({item, key}) => {
          return (
            <View
              style={{
                borderBottomWidth: pxToDp(1),
                borderBottomColor: colors.border,
                backgroundColor: "#fff"
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  if (item.audit_status == Cts.AUDIT_STATUS_FAILED) {
                    this.tips(item.audit_desc);
                  } else {
                    console.log(item);
                    this.props.navigation.navigate(Config.ROUTE_GOOD_STORE_DETAIL, {
                      pid: item.product_id,
                      storeId: item.store_id,
                      updatedCallback: (pid, prodFields, spFields) => {
                        if (typeof spFields.applying_price !== 'undefined') {
                          item.apply_price = spFields.applying_price
                        }
                      },
                    });
                  }
                }}
              >
                <View style={styles.item} key={key}>
                  <View style={[styles.center, styles.image]}>
                    <Image
                      style={{height: pxToDp(90), width: pxToDp(90)}}
                      source={{uri: item.cover_img}}
                    />
                  </View>
                  <View style={[styles.goods_name]}>
                    <View style={styles.name_text}>
                      <Text numberOfLines={2}>{item.product_name}</Text>
                    </View>
                    <View>
                      <Text style={styles.name_time}>
                        #{item.product_id} {tool.orderExpectTime(item.created)}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.center, styles.original_price]}>
                    <Text style={styles.price_text}>
                      {item.before_price / 100}
                    </Text>
                  </View>
                  <View style={[styles.center, styles.price]}>
                    <Text style={styles.price_text}>
                      {item.apply_price / 100}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              {this.state.isKf && this.state.audit_status == Cts.AUDIT_STATUS_WAIT ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: pxToDp(30),
                    paddingBottom: pxToDp(15),
                    backgroundColor: "#fff"
                  }}>
                  <View style={{
                    width: pxToDp(90),
                    justifyContent: "center",
                    alignItems: "center"
                  }}>
                    <Text
                      style={{
                        backgroundColor: item.auto_reject_time
                          ? "mediumseagreen"
                          : "#fff",
                        color: "#fff",
                        fontSize: pxToDp(30),
                        borderRadius: 2,
                        width: pxToDp(45),
                        height: pxToDp(45),
                        alignItems: "center",
                        textAlign: "center",
                        lineHeight: pxToDp(45),
                        justifyContent: "center"
                      }}
                    >
                      控
                    </Text>
                  </View>
                  {item.lower > 0 ? (
                    <Text style={{width: pxToDp(240)}}>
                      [{`${(item.lower / 100).toFixed(2)} - ${(
                      item.upper / 100
                    ).toFixed(2)}`}]
                    </Text>
                  ) : (
                    <Text style={{width: pxToDp(240)}}>无参考价</Text>
                  )}
                  <Button1
                    t="通过"
                    w={pxToDp(110)}
                    h={pxToDp(60)}
                    onPress={() => {
                      let url = `api/store_audit_action/${item.id}/yes?access_token=${this.props.global.accessToken}`;
                      getWithTpl(
                        url,
                        json => {
                          if (json.ok || json.ok === null) {
                            ToastLong("通过成功!");
                            this.setState({
                                query: true,
                                audit_status: Cts.AUDIT_STATUS_WAIT,
                                list: []
                              },
                              () => {
                                this.getApplyList(1);
                              }
                            );
                          } else {
                            ToastLong(json.reason);
                          }
                        },
                        error => {
                          ToastLong("失败!");
                        }
                      );
                    }}
                    mgt={0}/>
                  <Button1
                    t="拒绝"
                    w={pxToDp(110)}
                    h={pxToDp(60)}
                    mgt={0}
                    onPress={() => {
                      let url = `api/store_audit_action/${item.id}/no?access_token=${this.props.global.accessToken}`;
                      getWithTpl(
                        url,
                        json => {
                          if (json.ok || json.ok === null) {
                            ToastLong("已拒绝!");
                            this.setState({
                                query: true,
                                audit_status: Cts.AUDIT_STATUS_WAIT,
                                list: []
                              },
                              () => {
                                this.getApplyList(1);
                              }
                            );
                          } else {
                            ToastLong(json.reason);
                          }
                        },
                        error => {
                          ToastLong("失败!");
                        }
                      );
                    }}/>
                </View>
              ) : null}
            </View>
          );
        }}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          let {curr_page, total_page} = this.state;
          curr_page = parseInt(curr_page);
          total_page = parseInt(total_page);
          if (curr_page < total_page) {
            curr_page = curr_page + 1;
            this.setState({pullLoading: true});
            this.getApplyList(curr_page);
          }
        }}
        ListFooterComponent={() => {
          return this.state.pullLoading ? <LoadingView/> : <View/>;
        }}
        ListEmptyComponent={this.renderEmpty()}
        refreshing={false}
        onRefresh={async () => {
          this.setState({query: true, refresh: true});
          this.getApplyList(1);
        }}
      />
    );
  }

  renderEmpty(str = "没有相关记录") {
    if (!this.state.query) {
      return (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            marginTop: pxToDp(200)
          }}
        >
          <Image
            style={{width: pxToDp(100), height: pxToDp(135)}}
            source={require("../../img/Goods/zannwujilu.png")}
          />
          <Text
            style={{
              fontSize: pxToDp(24),
              color: "#bababa",
              marginTop: pxToDp(30)
            }}
          >
            {str}
          </Text>
        </View>
      );
    }
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <View style={styles.tab}>
          <TouchableOpacity
            onPress={() => {
              this.tab(Cts.AUDIT_STATUS_WAIT);
            }}
          >
            <View>
              <Text style={this.state.audit_status == Cts.AUDIT_STATUS_WAIT ? styles.active : styles.fontStyle}>
                审核中
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              this.tab(Cts.AUDIT_STATUS_PASSED);
            }}
          >
            <View>
              <Text style={this.state.audit_status == Cts.AUDIT_STATUS_PASSED ? styles.active : styles.fontStyle}>
                已审核
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              this.tab(Cts.AUDIT_STATUS_FAILED);
            }}
          >
            <View>
              <Text style={this.state.audit_status == Cts.AUDIT_STATUS_FAILED ? styles.active : styles.fontStyle}>
                未通过
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        {this.renderTitle()}
        <Toast icon="loading" show={this.state.query} onRequestClose={() => {
        }}>
          加载中
        </Toast>
        <Dialog
          onRequestClose={() => {
          }}
          visible={this.state.dialog}
          buttons={[
            {
              type: "warn",
              label: "",
              onPress: this.goToSetMap
            },
            {
              type: "default",
              label: "确定",
              onPress: () => this.setState({dialog: false})
            }
          ]}
        >
          <Text>{this.state.errMsg}</Text>
        </Dialog>
        {this.renderList()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tab: {
    paddingHorizontal: pxToDp(30),
    backgroundColor: "#fff",
    height: pxToDp(90),
    flexDirection: "row",
    justifyContent: "space-around"
  },
  fontStyle: {
    fontSize: pxToDp(28),
    marginTop: pxToDp(20),
    color: colors.fontColor
  },
  active: {
    color: colors.fontActiveColor,
    fontSize: pxToDp(28),
    marginTop: pxToDp(20),
    borderBottomWidth: pxToDp(3),
    borderBottomColor: colors.fontActiveColor,
    paddingBottom: pxToDp(20)
  },
  title: {
    height: pxToDp(55),
    paddingHorizontal: pxToDp(30),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: pxToDp(1),
    borderBottomColor: colors.border
  },
  title_text: {
    fontSize: pxToDp(24),
    width: pxToDp(90),
    textAlign: "center"
  },
  item: {
    paddingHorizontal: pxToDp(30),
    // height: pxToDp(140),
    paddingVertical: pxToDp(15),
    flexDirection: "row",
    justifyContent: "space-between",

    alignItems: "center"
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    height: pxToDp(100)
  },
  image: {
    width: pxToDp(90),
    height: "100%",
    flexDirection: "row",
    alignItems: "center"
  },
  goods_name: {
    width: pxToDp(240),
    height: pxToDp(100)
  },
  original_price: {
    width: pxToDp(120)
  },
  price: {
    width: pxToDp(120)
  },
  price_text: {
    color: "#ff0000",
    fontSize: pxToDp(30)
  },
  name_text: {
    width: "100%",
    minHeight: pxToDp(70)
  },
  name_time: {
    fontSize: pxToDp(18),
    color: colors.fontColor
  }
});
export default connect(mapStateToProps, mapDispatchToProps)(
  GoodsApplyRecordScene
);
