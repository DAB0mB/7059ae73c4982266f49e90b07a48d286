import './myTweets.scss';

import * as _ from 'lodash';
import React from 'react';
import RefreshIcon from 'react-icons/lib/fa/refresh';
import SignOutIcon from 'react-icons/lib/fa/sign-out';
import { store } from '~/app/state';

class MyTweets extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tweets: props.tweets || []
    };
  }

  componentWillReceiveProps(props) {
    const state = {};

    if (props.hasOwnProperty('tweets')) {
      state.tweets = props.tweets;
    }

    if (_.size(state)) {
      this.setState(state);
    }
  }

  render() {
    return (
      <div className="MyTweets">
        <SignOutIcon className="MyTweets-sign-out"
                     color="silver"
                     size={35}
                     onClick={this.disconnect.bind(this)} />

        <img className="MyTweets-profile-pic"
             src={this.props.user.profilePic}
             alt={this.props.user.name} />

        <div className="MyTweets-prologue">
          <span className="MyTweets-user-name">{this.props.user.name}</span>
        </div>

        <RefreshIcon className="MyTweets-refresh"
                     color="silver"
                     size={35}
                     onClick={this.disconnect.bind(this)} />

        <ul className="MyTweets-tweets-list">
          {this.state.tweets.map((tweet, index) => (
            <li className="MyTweets-tweet-item" key={index}>
              <div className="MyTweets-tweet-text">{tweet.text}</div>
              <div className="MyTweets-tweet-date">{tweet.tweetedAt}</div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  disconnect() {
    store.dispatch({ type: 'DISCONNECT_REQUEST' });
  }
}

export default MyTweets;
