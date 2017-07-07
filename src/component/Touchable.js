import React, { Component } from "react";
import { TouchableOpacity, Text } from "react-native";

export default class Touchable extends Component {
  render() {
    return (
      <TouchableOpacity
        onPress={this.props.onPress}
        style={{
          width: 100,
          height: 40,
          backgroundColor: "#2894ff",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Text>
          {this.props.text}
        </Text>
      </TouchableOpacity>
    );
  }
}
