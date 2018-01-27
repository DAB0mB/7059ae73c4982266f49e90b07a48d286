import React from 'react';
import TwitterLogin from 'react-twitter-auth';

class App extends React.Component {
  constructor() {
    super();

    this.state = { isAuthenticated: false, user: null, token: '' };
  }

  render() {
    const content = !!this.state.isAuthenticated ?
      (
        <div>
          <p>Authenticated</p>
          <div>
            {this.state.user.email}
          </div>
          <div>
            <button onClick={this.logout.bind(this)} className="button" >
              Log out
            </button>
          </div>
        </div>
      ) :
      (
        <TwitterLogin loginUrl="/api/connect"
                      requestTokenUrl="/api/request_oauth"
                      onFailure={this.onFailed.bind(this)}
                      onSuccess={this.onSuccess.bind(this)} />
      );

    return (
      <div className="App">
        {content}
      </div>
    );
  }

  onSuccess(response) {
    const token = response.headers.get('x-auth-token');

    response.json().then(user => {
      if (token) {
        this.setState({ isAuthenticated: true, user: user, token: token });
      }
    });
  }

  onFailed(err) {
    alert(err);
  }

  logout() {
    fetch('/api/disconnect', {
      method: 'POST',
      headers: new Headers({
        'x-auth-token': this.state.token
      })
    }).then(() => {
      this.setState({ isAuthenticated: false, token: '', user: null });
    }).catch((err) => {
      this.onFailed(err);
    });
  }
}

export default App;
