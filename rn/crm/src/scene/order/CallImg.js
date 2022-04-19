import React, {PureComponent} from 'react'
import pxToDp from "../../pubilc/util/pxToDp";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import colors from "../../pubilc/styles/colors";

class CallImg extends PureComponent {

  constructor(props) {
    super(props);
  }

  render() {
    return <FontAwesome5 name={'phone'} style={{color: colors.main_color, fontSize: pxToDp(22)}}/>;
  }
}

export default CallImg
