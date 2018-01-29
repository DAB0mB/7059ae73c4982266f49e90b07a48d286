import './app.scss';

import React from 'react';
import { Auth, MyTweets } from './containers';
import { store } from './state';

class App extends React.Component {
  constructor() {
    super();

    this.state = store.getState();

    this.unsubscribe = store.subscribe(() => {
      this.setState(store.getState());
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return (
      <div className="App">
        {this.state.authenticated ?
          <MyTweets user={this.state.user} tweets={this.state.tweets} /> :
          <Auth />
        }
      </div>
    );
  }
}

export default App;
