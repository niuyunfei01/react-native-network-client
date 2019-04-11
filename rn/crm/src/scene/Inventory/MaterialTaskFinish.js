import React from "react";
import native from "../../common/native";
import NavigationItem from "../../widget/NavigationItem";
import LoadMore from "react-native-loadmore";
import {StyleSheet, Text, View} from "react-native";
import {connect} from "react-redux";
import HttpUtils from "../../util/http";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class MaterialTaskFinish extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '我完成的任务',
      headerLeft: (
        <NavigationItem
          icon={require("../../img/Register/back_.png")}
          onPress={() => native.nativeBack()}
        />
      )
    }
  }
  
  constructor (props) {
    super(props)
    this.state = {
      tasks: []
    }
  }
  
  componentWillMount (): void {
    this.fetchData()
  }
  
  fetchData () {
    const self = this
    const navigation = this.props.navigation
    const accessToken = this.props.global.accessToken
    const api = `/api_products/material_task_finished?access_token=${accessToken}`
    HttpUtils.get.bind(navigation)(api).then(res => {
      self.setState({tasks: res})
    })
  }
  
  renderItem () {
    return (
      <For each='item' of={this.state.tasks} index='idx'>
        <View style={styles.item} key={idx}>
          <View style={{height: 20}}>
            <Text style={{color: '#000', fontWeight: 'bold'}}>{item.date}</Text>
          </View>
          <View style={{height: 30}}>
            <Text style={{color: '#000', fontWeight: 'bold', fontSize: 15}}>{item.sku.name}</Text>
          </View>
          <For each='entry' of={item.entries} index='entryIdx'>
            <View style={styles.entryItem} key={entryIdx}>
              <Text style={{fontSize: 12, flex: 1}}>{entry.product.name}</Text>
              <Text style={{fontSize: 12, width: 40, textAlign: 'left'}}>{entry.num}份</Text>
              <Text style={{fontSize: 12, width: 40, textAlign: 'right'}}>{entry.score}工分</Text>
            </View>
          </For>
        </View>
      </For>
    )
  }
  
  render () {
    return (
      <LoadMore
        onRefresh={() => this.fetchData}
        isLastPage={true}
        renderList={this.renderItem()}
        isLoading={false}
        loadMoreType={'scroll'}
      />
    );
  }
}

const styles = StyleSheet.create({
  item: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  entryItem: {
    flexDirection: 'row',
    width: '100%',
    height: 20
  }
})
export default connect(mapStateToProps)(MaterialTaskFinish)