const initialState = {
  authenticated: false,
  user: null,
  token: '',
  tweets: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'CONNECT':
      return connect(state, action.payload);
    case 'DISCONNECT':
      return disconnect(state);
    case 'SET_TWEETS':
      return setTweets(state, action.payload);
    default:
      return state;
  }
}

function connect(state, { token, user }) {
  return { ...state, token, user, authenticated: true };
}

function disconnect(state) {
  return { ...state, ...initialState };
}

function setTweets(state, { tweets }) {
  return { ...state, tweets };
}
