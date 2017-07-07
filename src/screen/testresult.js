import React, { Component } from "react";
import { Image, TouchableOpacity, View, Text } from "react-native";

export default class testresult extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    };
  };

  componentDidMount() {}

  render() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center"
        }}
      />
    );
  }
}
