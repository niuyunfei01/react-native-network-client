/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan 
 * @flow
 */

//import liraries
import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ListView, Image, StatusBar, FlatList } from 'react-native'

import api from '../../api'



// create a component
class AlertScene extends PureComponent {

    state: {
        discounts: Array<Object>,
        dataList: Array<Object>,
        refreshing: boolean,
    }

    constructor(props: Object) {
        super(props)
        this.state = {
            discounts: [],
            dataList: [],
            refreshing: false,
        }

         { (this: any).requestData = this.requestData.bind(this) }
        // { (this: any).renderCell = this.renderCell.bind(this) }
        // { (this: any).onCellSelected = this.onCellSelected.bind(this) }
         { (this: any).keyExtractor = this.keyExtractor.bind(this) }
         { (this: any).renderHeader = this.renderHeader.bind(this) }
        // { (this: any).onGridSelected = this.onGridSelected.bind(this) }
        // { (this: any).onMenuSelected = this.onMenuSelected.bind(this) }
    }

    componentDidMount() {
        this.requestData()
    }

    requestData() {
        this.setState({ refreshing: true })

        this.requestDiscount()
        this.requestRecommend()
    }

    async requestRecommend() {
        try {
            let response = await fetch(api.recommend)
            let json = await response.json()

            let dataList = json.data.map(
                (info) => {
                    return {
                        id: info.id,
                        imageUrl: info.squareimgurl,
                        title: info.mname,
                        subtitle: `[${info.range}]${info.title}`,
                        price: info.price
                    }
                }
            )

            this.setState({
                dataList: dataList,
                refreshing: false,
            })
        } catch (error) {
            this.setState({ refreshing: false })
        }
    }

    async requestDiscount() {
        try {
            let response = await fetch(api.discount)
            let json = await response.json()
            this.setState({ discounts: json.data })
        } catch (error) {
            alert(error)
        }
    }


    keyExtractor(item: Object, index: number) {
        return item.id
    }

    renderHeader() {
        return (
            <View>

            </View>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                <FlatList
                    data={this.state.dataList}
                    keyExtractor={this.keyExtractor}
                    onRefresh={this.requestData}
                    refreshing={this.state.refreshing}
                    ListHeaderComponent={this.renderHeader}
                />
            </View>
        );
    }
}

// define your styles
const styles = StyleSheet.create({

});

//make this component available to the app
export default AlertScene;
