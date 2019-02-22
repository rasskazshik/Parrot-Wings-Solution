import React, { Component } from 'react';
import { Route } from 'react-router';
import Login from './components/Login';
import Registration from './components/Registration';
import User from './components/User';
import './App.css';

export default class App extends Component {
  displayName = App.name

  render() {
      return (
          <div className="container totalContentContainer">
              <Route exact path='/' component={Login} />
              <Route exact path='/user' component={User} />
              <Route exact path='/registration' component={Registration} />
          </div>
    );
  }
}
