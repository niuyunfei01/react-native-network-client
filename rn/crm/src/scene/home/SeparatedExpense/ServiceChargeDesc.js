import React, {PureComponent} from 'react'
import {ScrollView, Text, View} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import HttpUtils from "../../../pubilc/util/http";
import colors from "../../../pubilc/styles/colors";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class ServiceChargeDesc extends PureComponent {
  constructor(props: Object) {
    super(props);
    this.state = {
      list: [],
    }
  }

  UNSAFE_componentWillMount() {
    this.fetch_list()
  }

  fetch_list = () => {
    const {global} = this.props;
    const url = `/v1/new_api/delivery/service_fee_rule?access_token=${global.accessToken}`;
    HttpUtils.post.bind(this.props)(url, {
      store_id: global.currStoreId,
    }).then(res => {
      this.setState({
        list: res.rules_format
      })
    })
  }

  render() {
    const {list} = this.state;
    return (
      <ScrollView
        automaticallyAdjustContentInsets={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={{
          paddingVertical: 12,
          paddingHorizontal: 10,
          flex: 1,
          backgroundColor: colors.f3,
          borderRadius: 4
        }}>
        <View style={{
          padding: 12,
          backgroundColor: colors.white,
          paddingBottom: 100,
        }}>
          <Text style={{color: colors.color333, fontSize: 16, fontWeight: 'bold', marginBottom: 12}}>规则 </Text>
          <For index='k' each='item' of={list}>
            <Text style={{fontSize: 14, color: colors.color333, marginTop: 4}}>{item} </Text>
          </For>
        </View>
      </ScrollView>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ServiceChargeDesc);
