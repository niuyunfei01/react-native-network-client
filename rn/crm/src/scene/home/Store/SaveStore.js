//import liraries
import React, {PureComponent} from "react";
import {Dimensions, InteractionManager, Text, View} from "react-native";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import HttpUtils from "../../../pubilc/util/http";
import PropTypes from "prop-types";
import colors from "../../../pubilc/styles/colors";
import {Button} from "react-native-elements";
import {SvgXml} from "react-native-svg";
import {back} from "../../../svg/svg";

const {width} = Dimensions.get("window");

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        ...globalActions
      },
      dispatch
    )
  };
}

// create a component
class SaveStore extends PureComponent {

  static propTypes = {
    dispatch: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      store_name: '',
      address: '',
      latlng: '',
      back: '',
      class: '',
      name: '',
      mobile: '',
      is_store_admin_or_owner: true,
    };

    this.fetchData = this.fetchData.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    let {loading} = this.state;
    if (loading) {
      return;
    }
    this.setState({loading: true});
    const {accessToken} = this.props.global;
    const api = `/v4/wsb_store/listOfStore?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then((res) => {
      this.setState({
        loading: false,
        store_list: res?.lists,
        is_store_admin_or_owner: res?.is_store_admin_or_owner,
      })
    })
  }

  onPress = (route, params = {}) => {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }


  render() {
    let {is_store_admin_or_owner} = this.state;
    return (
      <View style={{flex: 1, backgroundColor: colors.f5}}>

        <If condition={is_store_admin_or_owner}>
          {this.renderBtn()}
        </If>
      </View>
    )
  }

  renderHead = () => {
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        backgroundColor: colors.white,
        paddingHorizontal: 6,
      }}>
        <SvgXml style={{height: 44, marginRight: 8}} height={32} width={32} onPress={() => {
          this.props.navigation.goBack()
        }} xml={back()}/>
        <Text style={{
          color: colors.color333,
          fontSize: 17,
          fontWeight: 'bold',
          lineHeight: 24,
          marginRight: 40,
          flex: 1,
          textAlign: 'center'
        }}> 创建门店 </Text>
      </View>
    )
  }

  renderBtn = () => {
    return (
      <View style={{backgroundColor: colors.white, paddingHorizontal: 20, paddingVertical: 10, height: 62}}>
        <Button title={'保存并同步'}
                onPress={this.s}
                buttonStyle={[{
                  backgroundColor: colors.main_color,
                  borderRadius: 20,
                  length: 42,
                }]}
                titleStyle={{color: colors.white, fontWeight: 'bold', fontSize: 16, lineHeight: 22}}
        />
      </View>
    )
  }
}

//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(SaveStore);
