import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  twitterProvider: {
    type: {
      id: String,
      token: String
    },
    select: false
  }
});

UserSchema.set('toJSON', { getters: true, virtuals: true });

UserSchema.statics.upsertTwitterUser = function (token, tokenSecret, profile, callback) {
  return this.findOne({
    'twitterProvider.id': profile.id
  }, (err, user) => {
    if (user) return callback(err, user);

    user = new this({
      email: profile.emails[0].value,
      twitterProvider: {
        id: profile.id,
        token: token,
        tokenSecret: tokenSecret
      }
    });

    user.save(callback);
  });
};

export default mongoose.model('User', UserSchema);
