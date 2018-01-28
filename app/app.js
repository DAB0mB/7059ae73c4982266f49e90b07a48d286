import React from 'react';
import { TwitterLogin } from './components';
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
          <Logout disconnect={this.disconnect.bind(this)} user={this.state.user} /> :
          <Login setConnection={this.setConnection.bind(this)} />
        }
      </div>
    );
  }

  setConnection(res) {
    const token = res.headers.get('x-auth-token');

    if (!token) return;

    res.json()
      .then(user => store.dispatch({
        type: 'CONNECT',
        payload: { user, token },
      }))
      .then(() => store.dispatch({
        type: 'TWEETS_REQUEST',
        payload: { token },
      }));
  }

  disconnect() {
    store.dispatch({ type: 'DISCONNECT_REQUEST' });
  }
}

function Login(props) {
  return (
    <TwitterLogin className="Login"
                  loginUrl="/api/connect"
                  requestTokenUrl="/api/request_oauth"
                  onSuccess={props.setConnection}
                  onFailure={alert} />
  );
}

function Logout(props) {
  return (
    <div className="Logout">
      <p>Authenticated</p>
      <div>
        {props.user.name}
      </div>
      <div>
        <button onClick={props.disconnect} className="button" >
          Log out
        </button>
      </div>
    </div>
  );
}

export default App;
