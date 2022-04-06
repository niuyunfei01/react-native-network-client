import {Platform, StyleSheet} from 'react-native'
import pxToDp from '../../util/pxToDp';
import pxToEm from '../../util/pxToEm';

export default StyleSheet.create({
  container: {
    height: pxToDp(70),
    borderTopWidth: 1,
    borderTopColor: '#999',
    paddingHorizontal: pxToDp(20),
    flexDirection: 'row',
  },

  time_date: {
    marginRight: pxToDp(10),
  },
  time_date_text: {
    color: '#4d4d4d',
    fontSize: pxToEm(28),
    height: pxToDp(70),
    textAlignVertical: 'center',
  },
  time_start: {
    color: '#999',
    fontSize: pxToEm(28),
    height: pxToDp(70),
    textAlignVertical: 'center',
  },
  icon_clock: {
    marginLeft: pxToDp(70),
    marginRight: pxToDp(5),
    fontSize: 18,
    marginTop: pxToDp(5),
    ...Platform.select({
      ios: {},
      android: {
        alignSelf: 'center',
      }
    }),
  },
  time_end: {
    color: '#db5d5d',
    fontSize: pxToEm(34),
    height: pxToDp(70),
    textAlignVertical: 'center',
  },
  operator: {
    position: 'absolute',
    right: pxToDp(20),
  },
  operator_text: {
    fontSize: pxToEm(28),
    height: pxToDp(70),
    textAlignVertical: 'center',
  },
});
