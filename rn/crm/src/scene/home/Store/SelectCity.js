import React, {Component} from "react";
import {Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import _ from "lodash";
import {Line} from "../../common/component/All";
import {ToastLong} from "../../../pubilc/util/ToastUtils";
import {getWithTpl} from "../../../util/common";
import colors from "../../../pubilc/styles/colors";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global};
}

class SelectCity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      start: 0,
      cityList: [],
      allCityList: [],
      loading: false
    };
  }

  goTo = index => {
    let start = 0;
    for (let i = 0; i < index; i++) {
      start += this.state.cityList[i].cityList.length;
    }
    this.scrollView.scrollTo({y: 41 * start});
  };

  initCityList() {
    let self = this;
    if (self.state.loading) {
      return false;
    }
    self.setState({loading: true})
    ToastLong("获取城市列表中..")
    getWithTpl("DataDictionary/get_crm_city_list", function (data) {
      if (data.ok) {
        let cityList = data.obj;
        self.setState({cityList: cityList, allCityList: cityList, loading: false})
      }
    }, function (e) {
      self.setState({loading: false})
      console.error("get crm city list error ", e)
      ToastLong("获取城市列表错误！")
    })
  }

  UNSAFE_componentWillMount() {
    this.initCityList()
  }

  render() {
    let cityList = this.state.allCityList;
    return (
        <View style={{flex: 1, backgroundColor: "#fff"}}>
          {/*定位当前城市*/}
          <View
              style={{
                backgroundColor: colors.gray_f8,
                paddingHorizontal: 18,
                paddingVertical: 8,
                justifyContent: "center",
                alignItems: "center"
              }}
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
                  styles.n2grey9
                ]}
            >
              <TextInput
                  style={[
                    {width: "90%", textAlign: "center", padding: 0},
                    styles.n2grey9
                  ]}
                  placeholder="请输入城市名字"
                  value={this.state.searchValue}
                  autoCapitalize="none"
                  ref={textInput => {
                    this.textInput = textInput;
                  }}
                  underlineColorAndroid="transparent"
                  placeholderTextColor={colors.color999}
                  onChangeText={text => {
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
                      this.setState({
                        cityList: selectList
                      });
                    } else {
                      this.setState({
                        cityList: cityList
                      });
                    }
                  }}
              />
            </View>
          </View>
          <ScrollView
              style={{flex: 1}}
              ref={scrollView => {
                this.scrollView = scrollView;
              }}
          >
            {/*城市列表*/}
            <View style={{flexDirection: "row"}}>
              {/*按字母显示城市列表 (看下后台是怎么给的数据)*/}
              <View style={{width: Dimensions.get('window').width * 19 / 20}}>
                {this.state.cityList.map((item, index) => {
                  return (
                      <View>
                        {item.cityList.length ? (
                            <View
                                style={{
                                  height: 20,
                                  justifyContent: "center",
                                  backgroundColor: colors.main_back
                                }}
                            >
                              <Text
                                  style={[{paddingLeft: 18}, styles.n2grey6]}
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
                                    this.props.route.params.callback({
                                      cityId: element.id,
                                      name: element.city
                                    });
                                    this.props.navigation.goBack();
                                  }}
                              >
                                <View
                                    style={{height: 40, justifyContent: "center"}}
                                >
                                  <Text
                                      style={[{paddingLeft: 18}, styles.n1]}
                                      allowFontScaling={false}
                                  >
                                    {element.city}
                                  </Text>
                                </View>
                                <Line c={colors.gray_f8}/>
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
                width: Dimensions.get('window').width * 1 / 20,
                position: "absolute",
                right: 0,
                top: Platform.OS === "ios" ? 130 : 110
              }}
          >
            {cityList.map((item, index) => {
              return (
                  <TouchableOpacity onPress={() => this.goTo(index)}>
                    <Text
                        style={{textAlign: "center", fontSize: 10, lineHeight: 21}}
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

const styles = StyleSheet.create({
  n2grey9: {
    color: colors.color999,
    fontSize: 12
  },
  n1: {
    color: colors.color333,
    fontSize: 14
  },
  n2grey6: {
    color: colors.color666,
    fontSize: 12
  },
})

export default connect(mapStateToProps)(SelectCity);
