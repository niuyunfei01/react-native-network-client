'use strict';
import { StyleSheet,Platform } from 'react-native';
import Colors from './colors';

export default StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: Colors.default_container_bg
    },
    flexHCenter:{
        justifyContent:'center'
    },
    flexVCenter:{
        alignItems:'center'
    },
    txtCenter:{
        textAlign:'center'
    },
    flexColumn:{
        flexDirection: 'column',
    },
    flexRow:{
        flexDirection: 'row',
    },
    flex1:{
        flex:1
    },
    padding10:{
        padding:10
    },
    marginTop10:{
        marginTop:10
    },
    font12:{
        fontSize: 12,
    },
    font14:{
        fontSize: 14,
    },
    font16:{
        fontSize: 16,
    },
    font18:{
        fontSize: 18,
    },
    font20:{
        fontSize: 20,
    },
    font24:{
        fontSize: 24,
    },
    input:{
        height:30,
        marginBottom:10
    },
    marginNavTop:{
        marginTop:Platform.OS === 'ios' ? 64 : 54
    },
    navBarStyle:{
        height:Platform.OS === 'ios' ? 64 : 54,
        backgroundColor:Colors.default_theme
    },
    navTitleStyle:{
        textAlign: "center",
        color:'#fff',
        fontSize:20,
    },
    menuBarBtnIconStyle:{
        marginTop:5,
        width:25,
    },
    tabBarBtnStyle:{
        paddingTop:5
    },
    tabBarStyle:{
        padding:0,
        backgroundColor: 'white'
    },
});