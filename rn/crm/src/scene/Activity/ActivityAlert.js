import React, {PureComponent} from 'react';
import {

  ScrollView,

} from 'react-native';
import {
  Cells,
  Cell,
  CellHeader,
  CheckboxCells,
  CellBody,
  CellFooter,
  Label,
} from "../../weui/index";
import style from "./commonStyle";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Toast, Icon, Dialog} from "../../weui/index";

class ActivityAlert extends PureComponent{
  render(){
    return(
        <Dialog onRequestClose={() => {}}
                visible={this.props.showDialog}
                headerStyle={{
                  backgroundColor: colors.main_back,
                  paddingTop: pxToDp(20),
                  justifyContent: 'center',
                  paddingBottom: pxToDp(20),
                }}
                buttons={this.props.buttons}
                footerStyle={{
                  borderTopWidth: pxToDp(1),
                  borderTopColor: colors.fontGray,
                }}
                bodyStyle={{
                  borderRadius: pxToDp(10),
                  marginLeft: pxToDp(15),
                  marginRight: pxToDp(15),
                  maxHeight: pxToDp(700),
                  marginTop: 0
                }}
        >
          <ScrollView style={{minHeight:pxToDp(200)}}>
            {
              this.props.children
            }
          </ScrollView>
        </Dialog>
    )
  }
}



export default ActivityAlert;