import './twitterLogin.scss';

import React from 'react';
import PropTypes from 'prop-types';
import TwitterIcon from 'react-icons/lib/fa/twitter';
import { TWITTER_API } from '~/common/consts';

class TwitterLogin extends React.Component {
  static propTypes = {
    text: PropTypes.string,
    loginUrl: PropTypes.string.isRequired,
    requestTokenUrl: PropTypes.string.isRequired,
    onFailure: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    style: PropTypes.object,
    className: PropTypes.string,
    dialogWidth: PropTypes.number,
    dialogHeight: PropTypes.number,
    showIcon: PropTypes.bool,
    credentials: PropTypes.oneOf(['omit', 'same-origin', 'include']),
  }

  static defaultProps = {
    text: 'Sign in with Twitter',
    disabled: false,
    dialogWidth: 600,
    dialogHeight: 400,
    showIcon: true,
    credentials: 'same-origin'
  }

  constructor(props) {
    super(props);

    this.onButtonClick = this.onButtonClick.bind(this);
  }

  onButtonClick() {
    return this.getRequestToken();
  }

  getRequestToken() {
    var popup = this.openPopup();

    return fetch(this.props.requestTokenUrl, {
      method: 'POST',
      credentials: this.props.credentials,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(body => {
      return body.json();
    })
    .then(data => {
      popup.location = `${TWITTER_API}/oauth/authorize?oauth_token=${data.oauth_token}`;
      this.polling(popup);
    })
    .catch(error => {
      popup.close();
      return this.props.onFailure(error);
    });
  }

  openPopup() {
    const w = this.props.dialogWidth;
    const h = this.props.dialogHeight;
    const left = (window.screen.width/2)-(w/2);
    const top = (window.screen.height/2)-(h/2);

    return window.open('', '', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
  }

  polling(popup) {
    const polling = setInterval(() => {
      if (!popup || popup.closed || popup.closed === undefined) {
        clearInterval(polling);
        this.props.onFailure(new Error('Popup has been closed by user'));
      }

      const closeDialog = () => {
        clearInterval(polling);
        popup.close();
      };

      try {
        if (!popup.location.hostname.includes('api.twitter.com') &&
              !popup.location.hostname == '') {
          if (popup.location.search) {
            const query = new URLSearchParams(popup.location.search);

            const oauthToken = query.get('oauth_token');
            const oauthVerifier = query.get('oauth_verifier');

            closeDialog();
            return this.getOauthToken(oauthVerifier, oauthToken);
          } else {
            closeDialog();
            return this.props.onFailure(new Error(
              'OAuth redirect has occurred but no query or hash parameters were found. ' +
              'They were either not set during the redirect, or were removed—typically by a ' +
              'routing library—before Twitter react component could read it.'
            ));
          }


        }
      } catch (error) {
        // Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
        // A hack to get around same-origin security policy errors in IE.
      }
    }, 500);
  }

  getOauthToken(oAuthVerifier, oauthToken) {
    return fetch(`${this.props.loginUrl}?oauth_verifier=${oAuthVerifier}&oauth_token=${oauthToken}`, {
      method: 'POST',
      credentials: this.props.credentials,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      this.props.onSuccess(response);
    })
    .catch(error => {
      return this.props.onFailure(error);
    });
  }

  getDefaultButtonContent() {
    const defaultIcon = this.props.showIcon? <TwitterIcon color='#00aced' size={25}/> : null;

    return (
      <span>
        {defaultIcon} {this.props.text}
      </span>
    );
  }

  render() {
    return (
      <button className={`TwitterLogin ${this.props.className}`}
              disabled={this.props.disabled}
              style={this.props.style}
              onClick={this.onButtonClick} >
        {this.props.children ? this.props.children : this.getDefaultButtonContent()}
      </button>
    )
  }
}

export default TwitterLogin;
