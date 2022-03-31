//import liraries
import React, {PureComponent} from 'react'
import {Text, View} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import ModalSelector from "../../../widget/ModalSelector";
import * as tool from "../../../pubilc/common/tool";


function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class SelectStoreScene extends PureComponent {

  constructor(props) {
    super(props);
    const {canReadStores} = this.props.global;
    let storeActionSheet = tool.storeActionSheet(canReadStores);
    this.state = {
      modalVisible: true,
      storeActionSheet: storeActionSheet,
    };
    this._doChangeStore = this._doChangeStore.bind(this);
  }

  _doChangeStore(StoreId) {
    let {params} = this.props.route;
    let check_res = params.doneSelectStore(StoreId);
    if (!check_res) {
      this.setState({
        modalVisible: true,
      });
    }
  }

  render() {
    return (
        <View style={{backgroundColor: '#fff'}}>
          <ModalSelector
              onChange={(option) => {
                this._doChangeStore(option.key)
              }}
              modalVisible={this.state.modalVisible}
              skin='customer'
              data={this.state.storeActionSheet}
          >
            <Text> </Text>
          </ModalSelector>
        </View>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(SelectStoreScene)
