import React, { Component } from 'react'
import test from 'core/value'
import Test from 'views/Test.view.js'

console.log(test)

class App extends Component {
  render() {
    return <Test onClick={() => alert('just clicked a button!')} />
  }
}

export default App
