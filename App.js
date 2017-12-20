/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Login from './components/Login';
import StudentCards from './components/StudentCards';
import {Scene, Router,Stack} from 'react-native-router-flux';

export default class App extends Component<{}> {
  render() {
    return (
      <Router>
        <Stack key="root" hideNavBar={true}>
          <Scene key="login" component={Login} title="Login"/>
          <Scene key="home" component={StudentCards}/>
        </Stack>
      </Router>
    );
  }
}

