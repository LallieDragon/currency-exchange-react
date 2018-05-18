import React, { Component } from 'react';
import './App.css';
import CurrencyConverter from './CurrencyConverter';

class App extends Component {
  render() {
    return (
      <div className="App">
        <CurrencyConverter />
      </div>
    );
  }
}

export default App;
