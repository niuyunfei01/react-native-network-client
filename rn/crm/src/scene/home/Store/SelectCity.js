import React, {Component} from "react";
import {Dimensions, PanResponder, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import {cloneDeep} from "lodash";
import {ToastShort} from "../../../pubilc/util/ToastUtils";
import colors from "../../../pubilc/styles/colors";
import tool from "../../../pubilc/util/tool";
import Entypo from "react-native-vector-icons/Entypo";
import PropTypes from "prop-types";
import HttpUtils from "../../../pubilc/util/http";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

const {width, height} = Dimensions.get('window')

class SelectCity extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    route: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = {
      cityList: [],
      allCityList: [],
      loading: false,
      check_right: -1,
      check_rights: -1,
    };
  }

  goTo = index => {
    let start = 0;
    for (let i = 0; i < index; i++) {
      start += tool.length(this.state.cityList[i]?.cityList);
    }
    this.scrollView.scrollTo({y: 47 * start});
  };

  initCityList() {
    if (this.state.loading) {
      return;
    }
    this.setState({loading: true})
    ToastShort("获取城市列表中..")
    const api = `DataDictionary/get_crm_city_list`;
    HttpUtils.get.bind(this.props)(api).then((res) => {
      this.setState({cityList: res, allCityList: res, loading: false})
    }, () => {
      this.setState({loading: false})
      ToastShort("获取城市列表错误！")
    })
  }

  componentDidMount() {
    this.initCityList()
  }

  UNSAFE_componentWillMount() {

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        return true;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return true;
      },
      onPanResponderGrant: (evt, gestureState) => {
        return true;
      },
      onPanResponderMove: (evt, gestureState) => {

        if (Math.abs(gestureState.dy) < 3) {
          return;
        }
        let index = this.state.check_rights + Math.round(gestureState.dy / 18);
        if (this.state.check_right === index) {
          return true;
        }
        this.checkRight()
        this.goTo(index)
        this.setState({
          check_right: index,
        })
        return true;
      },
      onPanResponderRelease: (evt, gestureState) => {
        return true;
      },
      onPanResponderTerminate: (evt, gestureState) => {
        return true;
      },
    });
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

  checkRight = () => {
    tool.debounces(() => {
      this.setState({
        check_right: -1,
      })
    }, 1000)
  }

  render() {
    let {allCityList, check_right} = this.state;
    let {city = ''} = this.props.route.params;
    return (
      <TouchableOpacity onPress={() => this.props.navigation.goBack()} style={styles.contentWrap}>
        {/*定位当前城市*/}
        <If condition={city !== '选择城市'}>
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
              <Entypo name={'location-pin'} style={{
                fontSize: 15,
                color: colors.color666,
                textAlignVertical: "center"
              }}/>
              <Text style={styles.n1}> {city} </Text>
            </View>
          </View>
        </If>
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
        <View style={styles.quicklyPosition} {...this._panResponder.panHandlers}>
          {allCityList.map((item, index) => {
            return (
              <TouchableOpacity
                key={index}
                onPress={() => this.goTo(index)}
                onPressIn={() => {
                  this.goTo(index)
                  this.setState({
                    check_right: index,
                    check_rights: index,
                  })
                }}
                onPressOut={() => this.checkRight()}
              >
                <If condition={check_right === index}>
                  <View style={{
                    width: 40,
                    height: 40,
                    backgroundColor: 'rgba(2,2,2,0.5)',
                    borderRadius: 4,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: "absolute",
                    right: 50,
                  }}>
                    <Text style={{fontSize: 28, fontWeight: 'bold', color: colors.white}}> {item.key} </Text>
                  </View>
                </If>
                <Text style={styles.quicklyPositionText}> {item.key} </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </TouchableOpacity>
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
