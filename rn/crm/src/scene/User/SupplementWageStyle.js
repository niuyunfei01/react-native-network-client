import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";

export default {
	right_btn: {
		fontSize: pxToDp(40),
		textAlign: "center",
		color: colors.main_color
	},
	orderHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		backgroundColor: '#fff',
		height: pxToDp(80),
		alignItems: 'center',
		paddingHorizontal: 'center'
	},
	headerRight: {
		flexDirection: 'row'
	},
	orderContent: {
		marginTop: pxToDp(20),
		flexDirection: 'row',
		justifyContent: 'space-between'
	}
}