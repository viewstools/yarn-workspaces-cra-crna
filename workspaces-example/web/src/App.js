import React, {Component} from 'react';
import test from 'core/test';
import Test from 'views/Test.view.js';

alert(test);

class App extends Component {
  render() {
    return <Test onClick={() => alert('just clicked a button!')} />;
  }
}

export default App;
