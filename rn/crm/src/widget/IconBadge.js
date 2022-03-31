import React, {PureComponent} from 'react'
import {StyleSheet, View} from 'react-native';

class IconBadge extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <View style={[styles.MainView, (this.props.MainViewStyle ? this.props.MainViewStyle : {})]}>
          {
            // main element
            this.props.MainElement
          }
          {!this.props.Hidden &&
          <View style={[styles.IconBadge, (this.props.IconBadgeStyle ? this.props.IconBadgeStyle : {})]}>
            {
              // badge element
              this.props.BadgeElement
            }
          </View>
          }
        </View>
    )
  }
}


const styles = StyleSheet.create({
  IconBadge: {
    position: 'absolute',
    top: 1,
    right: 1,
    minWidth: 20,
    height: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF0000'
  },
  MainView: {}
});

export default IconBadge;
