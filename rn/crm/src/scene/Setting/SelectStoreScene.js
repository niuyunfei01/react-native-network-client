//import liraries
import React, {PureComponent} from 'react'
import {StyleSheet, Text, View} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import ModalSelector from "../../widget/ModalSelector/index";
import * as tool from "../../common/tool";


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
  static navigationOptions = {title: 'Select', header: null};

  constructor(props: Object) {
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
    console.log(this.props);
    let {params} = this.props.route.params;
    let check_res = params.doneSelectStore(StoreId);
    console.log('check_res -> ', check_res);
    if(!check_res){
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
          <Text>  </Text>
        </ModalSelector>
      </View>
    );
  }

}


const styles = StyleSheet.create({});


export default connect(mapStateToProps, mapDispatchToProps)(SelectStoreScene)
