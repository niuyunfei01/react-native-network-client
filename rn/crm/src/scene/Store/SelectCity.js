import React, { Component } from "react";
import {
  ScrollView,
  RefreshControl,
  View,
  Text,
  TouchableOpacity,
  Platform,
  TextInput
} from "react-native";
import { bindActionCreators } from "redux";
import CommonStyle from "../../common/CommonStyles";
import { connect } from "react-redux";
import { Button, CellsTitle } from "../../weui/index";
import CheckboxCells from "../../weui/Form/CheckboxCells";
import * as globalActions from "../../reducers/global/globalActions";
import * as tool from "../../common/tool";
import { ToastShort } from "../../util/ToastUtils";
import { Styles, Metrics, Colors } from "../../themes";

import Icon from "react-native-vector-icons/Ionicons";
import _ from "lodash";
import { cityList } from "../data";
import { Line } from "../component/All";

function mapStateToProps(state) {
  const { mine, global } = state;
  return { mine: mine, global: global };
}

class SelectCity extends Component {
  static navigationOptions = {
    headerTitle: "选择城市"
  };
  constructor(props) {
    super(props);
    this.state = {
      start: 0,
      cityList: cityList
    };
  }

  goTo = index => {
    let start = 0;

    for (let i = 0; i < index; i++) {
      start += this.state.cityList[i].cityList.length;
    }
    this.scrollView.scrollTo({ y: 41 * start });
  };

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        {/*定位当前城市*/}
        <View
          style={[
            {
              backgroundColor: Colors.greyf8,
              paddingHorizontal: 18,
              paddingVertical: 8
            },
            Styles.center
          ]}
        >
          <View
            style={[
              {
                height: 28,
                backgroundColor: "white",
                borderRadius: 13,
                textAlign: "center",
                flexDirection: "row",
                width: "100%",
                justifyContent: "center",
                alignItems: "center"
              },
              Styles.n2grey9
            ]}
          >
            <TextInput
              style={[
                { width: "90%", textAlign: "center", padding: 0 },
                Styles.n2grey9
              ]}
              placeholder="请输入城市名字"
              // selectTextOnFocus={true}
              value={this.state.searchValue}
              autoCapitalize="none"
              // autoFocus={true}
              ref={textInput => {
                this.textInput = textInput;
              }}
              underlineColorAndroid="transparent"
              placeholderTextColor={Colors.grey9}
              onChangeText={text => {
                console.log("原始的城市数据:%o", cityList);
                if (text) {
                  let reg = new RegExp(text);
                  let selectList = _.cloneDeep(cityList);
                  selectList.map(element => {
                    let data = [];
                    element.cityList.map(item => {
                      if (item.city.match(reg)) {
                        data.push(item);
                      }
                    });
                    element.cityList = data;
                  });
                  console.log("现在的城市数据:%o", selectList);
                  this.setState({
                    cityList: selectList
                  });
                } else {
                  console.log("没有输入");
                  this.setState({
                    cityList: cityList
                  });
                }
              }}
            />
          </View>
        </View>
        <View
          style={[
            { height: 50, marginLeft: 18, marginRight: 18 },
            Styles.between
          ]}
        >
          <View style={Styles.startcenter}>
            <Icon name={"ios-pin-outline"} size={17} color={Colors.theme} />
            <Text style={Styles.n1grey9} allowFontScaling={false}>
              {" "}
              当前定位城市
            </Text>
          </View>
          <Text style={Styles.n1b} allowFontScaling={false}>
            {"未获取到城市"}
          </Text>
        </View>
        <ScrollView
          style={{ flex: 1 }}
          ref={scrollView => {
            this.scrollView = scrollView;
          }}
        >
          {/*城市列表*/}
          <View style={{ flexDirection: "row" }}>
            {/*按字母显示城市列表 (看下后台是怎么给的数据)*/}
            <View style={{ width: Metrics.CW * 19 / 20 }}>
              {this.state.cityList.map((item, index) => {
                return (
                  <View>
                    {item.cityList.length ? (
                      <View
                        style={{
                          height: 20,
                          justifyContent: "center",
                          backgroundColor: Colors.line
                        }}
                      >
                        <Text
                          style={[{ paddingLeft: 18 }, Styles.n2grey6]}
                          allowFontScaling={false}
                        >
                          {item.key}
                        </Text>
                      </View>
                    ) : null}

                    {item.cityList.map(element => {
                      return (
                        <TouchableOpacity
                          onPress={() => {
                            this.props.navigation.state.params.callback({
                              cityId: element.id,
                              name: element.city
                            });
                            this.props.navigation.goBack();
                          }}
                        >
                          <View
                            style={{ height: 40, justifyContent: "center" }}
                          >
                            <Text
                              style={[{ paddingLeft: 18 }, Styles.n1]}
                              allowFontScaling={false}
                            >
                              {element.city}
                            </Text>
                          </View>
                          <Line c={Colors.greyf8} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/*英文字母*/}
        <View
          style={{
            width: Metrics.CW * 1 / 20,
            position: "absolute",
            right: 0,
            top: Platform.OS === "ios" ? 130 : 110
          }}
        >
          {cityList.map((item, index) => {
            return (
              <TouchableOpacity onPress={() => this.goTo(index)}>
                <Text
                  style={{ textAlign: "center", fontSize: 10, lineHeight: 21 }}
                  allowFontScaling={false}
                >
                  {item.key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }
}

export default connect(mapStateToProps)(SelectCity);
