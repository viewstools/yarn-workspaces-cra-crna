import React, { Component } from 'react'
import value from 'core/value'
import Test from 'views/Test.view.js'

alert(value)

class App extends Component {
  render() {
    return <Test onClick={() => alert('just clicked a button!')} />
  }
}

export default App
