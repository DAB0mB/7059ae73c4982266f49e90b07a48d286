import { all, call, put, takeLatest } from 'redux-saga/effects';
import { twitter } from '../services';
import store from './store';

export default function* rootSaga() {
  yield all([
    watchDisconnectRequest(),
    watchTweetsRequest(),
  ]);
}

function* watchDisconnectRequest() {
  yield takeLatest('DISCONNECT_REQUEST', disconnect);
}

function* watchTweetsRequest() {
  yield takeLatest('TWEETS_REQUEST', fetchTweets);
}

function* disconnect() {
  const { token } = store.getState();

  yield call(twitter.disconnect, token);

  yield put({
    type: 'DISCONNECT',
  });
}

function* fetchTweets() {
  const { token } = store.getState();

  const tweets = yield call(twitter.fetchTweets, token);

  yield put({
    type: 'SET_TWEETS',
    payload: { tweets },
  });
}
