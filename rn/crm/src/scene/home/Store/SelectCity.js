import React, {Component} from "react";
import {Dimensions, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import {cloneDeep} from "lodash";
import {Line} from "../../common/component/All";
import {ToastLong} from "../../../pubilc/util/ToastUtils";
import {getWithTpl} from "../../../pubilc/util/common";
import colors from "../../../pubilc/styles/colors";
import tool from "../../../pubilc/util/tool";

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global};
}

const {height} = Dimensions.get('window')

class SelectCity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cityList: [],
      allCityList: [],
      loading: false
    };
  }

  goTo = index => {
    let start = 0;
    for (let i = 0; i < index; i++) {
      start += tool.length(this.state.cityList[i].cityList);
    }
    this.scrollView.scrollTo({y: 41 * start});
  };

  onSuccess = (data) => {
    if (data.ok) {
      this.setState({cityList: data.obj, allCityList: data.obj, loading: false})
    }
  }

  onError = () => {
    this.setState({loading: false})
    ToastLong("获取城市列表错误！")
  }

  initCityList() {
    if (this.state.loading) {
      return;
    }
    this.setState({loading: true})
    ToastLong("获取城市列表中..")
    getWithTpl("DataDictionary/get_crm_city_list", (data) => this.onSuccess(data), () => this.onError())
  }

  componentDidMount() {
    this.initCityList()
  }

  onChangeText = (text) => {
    let {allCityList} = this.state;
    if (text) {
      let reg = new RegExp(text);
      let selectList = cloneDeep(allCityList);
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
    }
  }

  selectCity = (element) => {
    this.props.route.params.callback({
      cityId: element.id,
      name: element.city
    });
    this.props.navigation.goBack();
  }

  render() {
    let {allCityList} = this.state;
    return (
      <View style={styles.contentWrap}>
        {/*定位当前城市*/}
        <View style={styles.headerWrap}>
          <View style={[styles.searchWrap, styles.n2grey9]}>
            <TextInput style={[{width: "90%", textAlign: "center", padding: 0}, styles.n2grey9]}
                       placeholder="请输入城市名字"
                       value={this.state.searchValue}
                       autoCapitalize="none"
                       ref={textInput => this.textInput = textInput}
                       underlineColorAndroid="transparent"
                       placeholderTextColor={colors.color999}
                       onChangeText={text => this.onChangeText(text)}
            />
          </View>
        </View>
        <ScrollView
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={styles.cityContentWrap} ref={scrollView => this.scrollView = scrollView}>
          {/*城市列表*/}
          {/*按字母显示城市列表 (看下后台是怎么给的数据)*/}
          <View style={{width: height * 19 / 20}}>
            {this.state.cityList.map((item, index) => {
              return (
                <View key={index}>
                  <If condition={tool.length(item.cityList)}>
                    <Text style={[styles.cityKeyText, styles.n2grey6]}>
                      {item.key}
                    </Text>
                  </If>

                  {item.cityList.map((element, id) => {
                    return (
                      <TouchableOpacity key={id} onPress={() => this.selectCity(element)}>
                        <Text style={[{paddingVertical: 10, paddingLeft: 18}, styles.n1]} allowFontScaling={false}>
                          {element.city}
                        </Text>
                        <Line c={colors.gray_f8}/>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/*英文字母*/}
        <View style={styles.quicklyPosition}>
          {allCityList.map((item, index) => {
            return (
              <TouchableOpacity key={index} onPress={() => this.goTo(index)}>
                <Text style={styles.quicklyPositionText}>
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
  cityContentWrap: {
    flex: 1, backgroundColor: colors.white
  },
  cityKeyText: {
    paddingLeft: 18, paddingVertical: 5, backgroundColor: colors.f2
  },
  quicklyPositionText: {
    textAlign: "center", fontSize: 10, lineHeight: 21
  },
  quicklyPosition: {
    width: height / 20,
    position: "absolute",
    right: 0,
    top: Platform.select({android: 110, ios: 130})
  },
  searchWrap: {
    height: 28,
    backgroundColor: colors.white,
    borderRadius: 13,
    textAlign: "center",
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  headerWrap: {
    backgroundColor: colors.gray_f8,
    paddingHorizontal: 18,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center"
  },
  contentWrap: {
    flex: 1,
  },
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
