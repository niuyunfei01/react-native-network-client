import React, {Component} from "react";
import {Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import {cloneDeep} from "lodash";
import {ToastLong} from "../../../pubilc/util/ToastUtils";
import {getWithTpl} from "../../../pubilc/util/common";
import colors from "../../../pubilc/styles/colors";
import tool from "../../../pubilc/util/tool";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

const {width, height} = Dimensions.get('window')

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
    this.scrollView.scrollTo({y: 47 * start});
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
          <Text style={styles.n1}>当前定位城市 </Text>
          <View style={{
            backgroundColor: colors.f5,
            height: 28,
            borderRadius: 14,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 4,
          }}>
            <Text style={styles.n1}> 北京 </Text>
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
                <View key={index} style={{flex: 1}}>
                  <If condition={tool.length(item.cityList)}>
                    <Text style={[styles.cityKeyText]}>
                      {item.key}
                    </Text>
                  </If>

                  <View style={{
                    paddingHorizontal: 20,
                  }}>
                    {item.cityList.map((element, id) => {
                      return (
                        <TouchableOpacity key={id} style={{
                          width: width - 40,
                          borderBottomWidth: 0.5,
                          paddingVertical: 14,
                          borderBottomColor: colors.e5,
                        }}
                                          onPress={() => this.selectCity(element)}>
                          <Text style={styles.n1}
                                allowFontScaling={false}>
                            {element.city}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/*英文字母*/}
        <View style={styles.quicklyPosition}>
          {allCityList.map((item, index) => {
            return (
              <TouchableOpacity
                key={index}
                onPress={() => this.goTo(index)}
              >
                <Text style={styles.quicklyPositionText}> {item.key} </Text>
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
    paddingLeft: 20,
    paddingVertical: 6,
    backgroundColor: colors.f5,
    color: colors.color333,
    fontSize: 14,
    fontWeight: 'bold'
  },
  quicklyPositionText: {
    textAlign: "center", fontSize: 12, lineHeight: 21, fontWeight: 'bold', color: colors.color666
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
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 14,
    justifyContent: 'space-between',
    alignItems: "center"
  },
  contentWrap: {
    flex: 1,
    backgroundColor: colors.f5
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
