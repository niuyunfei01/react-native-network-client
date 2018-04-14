import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Icon from "react-native-vector-icons/Ionicons";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  FlatList,
  PixelRatio
} from "react-native";
import { NavigationItem } from "../../widget";
import pxToDp from "../../util/pxToDp";
import { Metrics, Colors, Styles } from "../../themes";
import LoadingView from "../../widget/LoadingView";

import { Left } from "../component/All";
import { getWithTpl, jsonWithTpl } from "../../util/common";
import tool from "../../common/tool";
import { ToastLong } from "../../util/ToastUtils";

const mapStateToProps = state => {
  return {
    global: state.global, //全局token
    mine: state.mine
  };
};
class NewProductDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visual: false,
      price: this.props.navigation.state.params.price,
      storeList: [],
      isLoading: true,
      storeTag: "",
      isSave: false
    };
  }
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerTitle: "新增商品",
      headerLeft: (
        <NavigationItem
          icon={require("../../img/Register/back_.png")}
          iconStyle={{
            width: pxToDp(48),
            height: pxToDp(48),
            marginLeft: 18
            // marginTop: pxToDp(20)
          }}
          onPress={() => navigation.goBack()}
        />
      ),
      headerRight: (
        <TouchableOpacity onPress={() => params.save()}>
          <View style={{ marginRight: 18 }}>
            <Text style={{ color: "#59b26a" }}>保存</Text>
          </View>
        </TouchableOpacity>
      )
    };
  };
  componentWillMount() {
    this.props.navigation.setParams({
      save: this.save
    });
    let { currVendorId } = tool.vendor(this.props.global);
    let storeList = this.toStores(this.props.mine.vendor_stores[currVendorId]);
    this.setState({
      storeTag: storeList
    });
    console.log("storeList:%o", storeList);
    this.fetchResources(currVendorId || 0);
  }
  //保存函数
  save = () => {
    console.log("保存");
    if (!this.state.price) return ToastLong("请输入商品价格");
    if (!this.getCategory()) return ToastLong("请选择门店分类");
    if (this.state.isSave) return;
    this.setState({
      isSave: true
    });
    let category = this.state.storeList.filter(element => {
      return element.active === true;
    });
    let payload = {
      vendor_id: tool.vendor(this.props.global).currVendorId,
      categories: category,
      product_id: this.props.navigation.state.params.productId,
      price: this.state.price
    };
    console.log("json", JSON.stringify(payload));
    jsonWithTpl(
      `api/direct_product_save?access_token=${this.props.global.accessToken}`,
      payload,
      ok => {
        if (ok.ok) {
          ToastLong(ok.desc);
          this.props.navigation.goBack();
        } else {
          ToastLong(ok.reason);
          this.props.navigation.goBack();
        }
        console.log("结果是什么:%o", ok);
      },
      error => {
        ToastLong("网络错误");
        this.props.navigation.goBack();
      },
      action => {}
    );
  };
  //获取数据
  fetchResources = currVendorId => {
    let url = `api/list_vendor_tags/${currVendorId}?access_token=${
      this.props.global.accessToken
    }`;
    http: getWithTpl(
      url,
      json => {
        console.log("判断是否联营:%o", json.obj);
        if (json.ok) {
          for (let i of json.obj) {
            i.active = false;
          }
          this.setState({
            storeList: json.obj,
            isLoading: false
          });
          // this.cooperation = json.obj;
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
  //发布一下门店函数
  toStores(obj) {
    let arr = [];
    if (obj) {
      tool.objectMap(obj, (item, id) => {
        arr.push(item.name);
      });
      return arr.join(" , ");
    }
  }
  title = text => {
    return (
      <View
        style={{
          height: 45,
          justifyContent: "center",
          paddingHorizontal: 18,
          backgroundColor: "#f2f2f2"
        }}
      >
        <Text style={{ fontSize: 16, color: "#ccc" }}>{text}</Text>
      </View>
    );
  };
  info = (title, info, right, id) => {
    return (
      <TouchableOpacity
        onPress={() => (id === 3 ? this.setState({ visual: true }) : null)}
      >
        <View
          style={{
            height: 45,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            paddingHorizontal: 18
          }}
        >
          <Text style={{ fontSize: 18, color: "#333" }}>{title}</Text>
          <Text
            style={{ fontSize: 16, color: "#bfbfbf", marginLeft: 20, flex: 1 }}
          >
            {info}
          </Text>
          {right}
        </View>
        <View style={{ height: 1, backgroundColor: "#f2f2f2" }} />
      </TouchableOpacity>
    );
  };
  select = element => {
    let storeList = this.state.storeList;
    element.active = !element.active;
    this.setState({
      storeList: storeList
    });
  };
  modal = () => {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          this.setState({ visual: false });
        }}
      >
        <View
          style={[
            {
              position: "absolute",
              width: "100%",
              height: Metrics.CH - 60,
              backgroundColor: "rgba(0,0,0,0.7)",
              zIndex: 200
            },
            Styles.center
          ]}
        >
          <View style={styles.content}>
            <View
              style={{
                height: 55,
                backgroundColor: "#f2f2f2",
                alignItems: "center",
                justifyContent: "center",
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8
              }}
            >
              <Text style={Styles.n1grey6}>门店分类（多选）</Text>
            </View>
            <ScrollView style={{ flex: 1, paddingHorizontal: 18 }}>
              {this.state.storeList.map(element => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      this.select(element);
                    }}
                  >
                    <View
                      style={[
                        {
                          flexDirection: "row",
                          // justifyContent: "center",
                          alignItems: "center",
                          padding: 12
                        }
                      ]}
                    >
                      <Yuan
                        icon={"md-checkmark"}
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
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#9d9d9d",
                          marginLeft: 20
                        }}
                      >
                        {element.name}
                      </Text>
                    </View>
                    <Line h={1.3} />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View
              style={[
                { flexDirection: "row", alignItems: "center" },
                Styles.t1theme
              ]}
            >
              <View
                style={{
                  flex: 1,
                  borderRightColor: Colors.line,
                  borderRightWidth: 1.5
                }}
              >
                <Text
                  style={[{ textAlign: "center" }, Styles.t1grey6]}
                  allowFontScaling={false}
                >
                  取消
                </Text>
              </View>
              <View style={{ flex: 1, paddingVertical: 16 }}>
                <TouchableWithoutFeedback
                  onPress={() => this.setState({ visual: false })}
                  // 	unbindWechat(this.state.data[0].id).then(resp => {
                  // 		toastOnShow('解绑成功')
                  // 		this.setState({
                  // 			isBind: false
                  // 		})
                  // 		this.props.callback1()
                  // 	})
                  // }}
                >
                  <Text
                    style={[{ textAlign: "center" }, Styles.t1grey6]}
                    allowFontScaling={false}
                  >
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
    let data = this.state.storeList.filter(element => {
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
    let active = this.state.storeList.filter(element => {
      return element.active === true;
    });
    return this.state.isLoading ? (
      <LoadingView />
    ) : (
      <View style={{ flex: 1 }}>
        {this.state.visual ? this.modal() : null}
        {this.title("基本信息")}
        <Left
          title="商品名称"
          info={this.props.navigation.state.params.title}
        />
        <Left
          title="商品价格"
          // placeholder={}
          value={this.state.price}
          onChangeText={text => this.setState({ price: text })}
          right={
            <Text style={{ fontSize: 14, color: "#ccc", fontWeight: "bold" }}>
              元
            </Text>
          }
        />
        <Left
          title="门店分类"
          onPress={() => this.setState({ visual: true })}
          info={this.getCategory() || "选择门店分类"}
          right={
            <Text style={{ fontSize: 14, color: "#ccc", fontWeight: "bold" }}>
              >
            </Text>
          }
        />
        {/*现实选择门店分类信息*/}
        <View style={{ padding: 18 }}>
          <Text style={{ fontSize: 14, color: "#9d9d9d" }}>
            发布到以下门店：
          </Text>
          <Text style={{ fontSize: 14, color: "#9d9d9d", marginTop: 5 }}>
            {this.state.storeTag}
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
          {icon ? <Icon name={icon} color={ic} size={size} /> : null}

          {t ? (
            <Text style={fontStyle} allowFontScaling={false}>
              {t}
            </Text>
          ) : null}
          {image || images ? (
            <Image
              source={image ? image : { uri: images }}
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
    const { w, h, mgt, mgb, c, fontStyle, t } = this.props;
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
