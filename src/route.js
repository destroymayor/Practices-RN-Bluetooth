/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";

import home from "./screen/home";

import {
  StackNavigator,
  NavigationActions,
  getStateForAction
} from "react-navigation";

const Route = StackNavigator(
  {
    home: { screen: home }
  },
  {
    initialRouteName: "home",
    navigationOptions: {
      gesturesEnabled: false
    }
  }
);

const navigateOnce = getStateForAction => (action, state) => {
  const { type, routeName } = action;
  return state &&
  type === NavigationActions.NAVIGATE &&
  routeName === state.routes[state.routes.length - 1].routeName
    ? null
    : getStateForAction(action, state);
};

Route.router.getStateForAction = navigateOnce(Route.router.getStateForAction);

export default class App extends Component {
  render() {
    //close navigation console
    return <Route onNavigationStateChange={null} />;
  }
}
