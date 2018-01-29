import './auth.scss';

import React from 'react';
import { TwitterLogin } from '~/app/components';
import { store } from '~/app/state';

class Auth extends React.Component {
  render() {
    return (
      <div className="Auth">
        <TwitterLogin size={100}
                      loginUrl="/api/connect"
                      requestTokenUrl="/api/request_oauth"
                      onSuccess={this.setConnection.bind(this)}
                      onFailure={alert} />
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
}

export default Auth;
