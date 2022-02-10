import React, {Component} from "react";
import {connect} from "react-redux";
import Icon from "react-native-vector-icons/Ionicons";
import {
  Image,
  PixelRatio,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import {Colors, Metrics, Styles} from "../../themes";
import LoadingView from "../../widget/LoadingView";
import {getVendorStores} from "../../reducers/mine/mineActions";
import {Left} from "../component/All";
import {getWithTpl, jsonWithTpl} from "../../util/common";
import tool from "../../common/tool";
import {hideModal, showModal, ToastLong} from "../../util/ToastUtils";
import native from "../../common/native";

const mapStateToProps = state => {
  return {
    global: state.global, //全局token
    mine: state.mine
  };
};

class NewProductDetail extends Component {
  constructor(props) {
    super(props);
    let {currVendorId} = tool.vendor(this.props.global);
    let {currStoreId} = this.props.global;
    let pid = this.props.route.params.productId;
    this.state = {
      visual: false,
      price: this.props.route.params.price,
      checkList: [],
      tagList: [],
      isLoading: false,
      isSave: false,
      vendorId: currVendorId,
      currNewProductStoreId: currStoreId,
      pid: pid,
      vendor_stores: ''
    };
    this.fetchTags(currVendorId || 0, pid);
    this.getVendorStore();
  }

  navigationOptions = ({navigation, route}) => {
    const {params = {}} = navigation.state;
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => params.save()}>
          <View style={{marginRight: 18}}>
            <Text style={{color: "#59b26a"}}>保存</Text>
          </View>
        </TouchableOpacity>
      )
    });
  };

  UNSAFE_componentWillMount() {
    this.props.navigation.setParams({
      save: this.save
    });
  }

  save = () => {
    if (!this.state.price) return ToastLong("请输入商品价格");
    if (!this.getCategory()) return ToastLong("请选择门店分类");
    if (this.state.isSave) return;
    this.setState({
      isSave: true
    });
    showModal('正在保存')
    let category = this.state.tagList.filter(element => {
      return element.active === true;
    });
    let {vendorId, currNewProductStoreId} = this.state;
    let payload = {
      vendor_id: vendorId,
      store_id: currNewProductStoreId,
      categories: category,
      product_id: this.props.route.params.productId,
      price: this.state.price
    };
    jsonWithTpl(`api/direct_product_save?access_token=${this.props.global.accessToken}`,
      payload,
      ok => {
        hideModal()
        if (ok.ok) {
          ToastLong(ok.desc);
          native.toGoods.bind(this)();
        } else {
          ToastLong(ok.reason);
        }
        this.setState({
          isSave: false
        });
      },
      error => {
        ToastLong("保存失败");
        hideModal()
        this.setState({
          isSave: false
        });
      },
      action => {
      }
    );
  };

  fetchCheckedTags = (vendorId, pid) => {
    let url = `api/list_vendor_checked_tags/${pid}/${vendorId}?access_token=${this.props.global.accessToken}`
    getWithTpl(
      url,
      json => {
        if (json.ok) {
          let self = this;
          let checkList = json.obj;
          if (checkList.length > 0) {
            checkList.forEach(function (tagId) {
              self.checkTag(tagId)
            })
          }
          this.setState({
            checkList: checkList,
          });
        }
      },
      error => {
      }
    );
  };

  checkTag = tagId => {
    let tagList = this.state.tagList;
    let tagCopy = tagList.map(function (item) {
      if (item.id == tagId) {
        item.active = !item.active;
      }
      return item;
    })
    this.setState({
      tagList: tagCopy
    });
  }

  //获取数据
  fetchTags = (currVendorId, pid) => {
    let url = `api/list_vendor_tags/${currVendorId}?access_token=${this.props.global.accessToken}`;
    getWithTpl(
      url,
      json => {
        if (json.ok) {
          for (let i of json.obj) {
            i.active = false;
          }
          this.setState({
            tagList: json.obj,
            isLoading: false
          });
          this.fetchCheckedTags(currVendorId, pid);
        } else {
          this.setState({
            isLoading: false
          });
        }
      },
      error => {
        this.setState({
          isLoading: false
        });
      }
    );
  };

  getVendorStore() {
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    let {currVendorId} = tool.vendor(this.props.global);
    let _this = this;
    dispatch(
      getVendorStores(currVendorId, accessToken, resp => {
        if (resp.ok) {
          let curr_stores = resp.obj;
          let curr_stores_arr = [];
          Object.values(curr_stores).forEach((item, id) => {
            curr_stores_arr.push(item.name);
          });
          _this.setState({
            vendor_stores: curr_stores_arr.join(" , ")
          });
        }
      })
    );
  }

  title = text => {
    return (
      <View style={{
        height: 45,
        justifyContent: "center",
        paddingHorizontal: 18,
        backgroundColor: "#f2f2f2"
      }}>
        <Text style={{fontSize: 16, color: "#ccc"}}>{text}</Text>
      </View>
    );
  };
  info = (title, info, right, id) => {
    return (
      <TouchableOpacity onPress={() => (id === 3 ? this.setState({visual: true}) : null)}>
        <View
          style={{
            height: 45,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            paddingHorizontal: 18
          }}>
          <Text style={{fontSize: 18, color: "#333"}}>{title}</Text>
          <Text style={{fontSize: 16, color: "#bfbfbf", marginLeft: 20, flex: 1}}>
            {info}
          </Text>
          {right}
        </View>
        <View style={{height: 1, backgroundColor: "#f2f2f2"}}/>
      </TouchableOpacity>
    );
  };
  select = element => {
    this.checkTag(element.id)
  };
  modal = () => {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          this.setState({visual: false});
        }}>
        <View style={[
          {
            position: "absolute",
            width: "100%",
            height: Metrics.CH - 60,
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 200
          },
          Styles.center
        ]}>
          <View style={styles.content}>
            <View
              style={{
                height: 55,
                backgroundColor: "#f2f2f2",
                alignItems: "center",
                justifyContent: "center",
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8
              }}>
              <Text style={Styles.n1grey6}>门店分类（多选）</Text>
            </View>
            <ScrollView style={{flex: 1, paddingHorizontal: 18}}>
              {this.state.tagList.map(element => {
                return (<TouchableOpacity key={element.id}
                                          onPress={() => {
                                            this.select(element);
                                          }}>
                  <View style={[{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 12
                  }]}>
                    <Yuan icon={"md-checkmark"}
                          size={15}
                          ic={Colors.white}
                          w={22}
                          onPress={() => {
                            this.select(element);
                          }}
                          bw={Metrics.one}
                          bgc={element.active ? Colors.grey9 : Colors.white}
                          bc={element.active ? Colors.white : Colors.greyc}
                    />
                    <Text style={{
                      fontSize: 14,
                      color: "#9d9d9d",
                      marginLeft: 20
                    }}>
                      {element.name}
                    </Text>
                  </View>
                  <Line h={1.3}/>
                </TouchableOpacity>);
              })}
            </ScrollView>
            <View style={[{flexDirection: "row", alignItems: "center"}, Styles.t1theme]}>
              <View style={{
                flex: 1,
                borderRightColor: Colors.line,
                borderRightWidth: 1.5
              }}>
                <Text style={[{textAlign: "center"}, Styles.t1grey6]} allowFontScaling={false}>
                  取消
                </Text>
              </View>
              <View style={{flex: 1, paddingVertical: 16}}>
                <TouchableWithoutFeedback onPress={() => this.setState({visual: false})}>
                  <Text style={[{textAlign: "center"}, Styles.t1grey6]} allowFontScaling={false}>
                    确定
                  </Text>
                </TouchableWithoutFeedback>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };
  getCategory = () => {
    let data = this.state.tagList.filter(element => {
      return element.active === true;
    });
    if (data && data.length) {
      return data
        .map(element => {
          return element.name;
        })
        .join(",");
    } else {
      return undefined;
    }
  };

  render() {
    return this.state.isLoading ? (
      <LoadingView/>
    ) : (
      <View style={{flex: 1}}>
        {/*<Toast*/}
        {/*  icon="loading"*/}
        {/*  show={this.state.isSave}*/}
        {/*>正在保存，请稍后!*/}
        {/*</Toast>*/}
        {this.state.visual ? this.modal() : null}
        {this.title("基本信息")}
        <Left
          title="商品名称"
          info={this.props.route.params.title}
        />
        <Left
          title="商品价格"
          value={this.state.price}
          onChangeText={text => this.setState({price: text})}
          right={
            <Text style={{fontSize: 14, color: "#ccc", fontWeight: "bold"}}>
              元
            </Text>
          }
        />
        <Left
          title="门店分类"
          onPress={() => this.setState({visual: true})}
          editable={false}
          info={this.getCategory() || "选择门店分类"}
          right={
            <Text style={{fontSize: 14, color: "#ccc", fontWeight: "bold"}}>
              >
            </Text>
          }/>
        {/*现实选择门店分类信息*/}
        <View style={{padding: 18}}>
          <Text style={{fontSize: 14, color: "#9d9d9d"}}>
            发布到以下门店：
          </Text>
          <Text style={{fontSize: 14, color: "#9d9d9d", marginTop: 5}}>
            {this.state.vendor_stores}
          </Text>
        </View>
      </View>
    );
  }
}

class Yuan extends Component {
  static defaultProps = {
    w: Metrics.CW / 10,
    bgc: Colors.white,
    size: 20
  };

  render() {
    let {
      w,
      bgc,
      ic,
      size,
      bc,
      bw,
      t,
      fontStyle,
      icon,
      image,
      images,
      mgt,
      mgb,
      mgl,
      mgr,
      onPress
    } = this.props;
    return (
      <TouchableWithoutFeedback onPress={onPress}>
        <View
          style={[
            {
              width: w,
              height: w,
              borderRadius: w / 2,
              borderColor: bc,
              borderWidth: bw,
              backgroundColor: bgc,
              marginTop: mgt,
              marginBottom: mgb,
              marginLeft: mgl,
              marginRight: mgr
            },
            Styles.center
          ]}
        >
          {icon ? <Icon name={icon} color={ic} size={size}/> : null}

          {t ? (
            <Text style={fontStyle} allowFontScaling={false}>
              {t}
            </Text>
          ) : null}
          {image || images ? (
            <Image
              source={image ? image : {uri: images}}
              style={{
                width: w,
                height: w,
                borderRadius: w / 2,
                borderColor: bc,
                borderWidth: bw
              }}
            />
          ) : null}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

class Line extends Component {
  static defaultProps = {
    h: 1 / PixelRatio.get(),
    c: Colors.line
  };

  render() {
    const {w, h, mgt, mgb, c, fontStyle, t} = this.props;
    return (
      <View
        style={{
          width: w,
          height: h,
          marginTop: mgt,
          marginBottom: mgb,
          backgroundColor: c
        }}
      >
        {this.props.t ? (
          <Text style={fontStyle} allowFontScaling={false}>
            {t}
          </Text>
        ) : null}
      </View>
    );
  }
}

let styles = StyleSheet.create({
  content: {
    width: Metrics.CW * 0.85,
    borderWidth: 1.5,
    borderColor: "#d3d3d3",
    height: Metrics.CH * 0.6,
    backgroundColor: Colors.white,
    borderRadius: 8
  }
});
export default connect(mapStateToProps)(NewProductDetail);
