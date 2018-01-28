export function fetchTweets(token) {
  return fetch('/api/tweets', {
    method: 'GET',
    headers: new Headers({
      'x-auth-token': token
    })
  }).then(body => body.json());
}

export function disconnect(token) {
  return fetch('/api/disconnect', {
    method: 'POST',
    headers: new Headers({
      'x-auth-token': token
    })
  }).then(body => body.json());
}
