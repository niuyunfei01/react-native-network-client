import {StyleSheet} from 'react-native'
import pxToDp from '../../util/pxToDp';

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
    fontSize: pxToDp(28),
    height: pxToDp(70),
    textAlignVertical: 'center',
  },
  time_start: {
    color: '#999',
    fontSize: pxToDp(28),
    height: pxToDp(70),
    textAlignVertical: 'center',
  },
  icon_clock: {
    marginLeft: pxToDp(70),
    marginRight: pxToDp(5),
    width: pxToDp(35),
    height: pxToDp(35),
    marginTop: pxToDp(5),
    alignSelf: 'center',
  },
  time_end: {
    color: '#db5d5d',
    fontSize: pxToDp(34),
    height: pxToDp(70),
    textAlignVertical: 'center',
  },
  operator: {
    position: 'absolute',
    right: pxToDp(20),
  },
  operator_text: {
    fontSize: pxToDp(28),
    height: pxToDp(70),
    textAlignVertical: 'center',
  },
});
