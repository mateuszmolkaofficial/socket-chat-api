const mongoose = require('mongoose');
const Schema = mongoose.Schema;

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes*60000);
}

const LoginSchema = new Schema({
  identityKey: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  failedAttempts: {
    type: Number,
    required: true,
    default: 0
  },
  timeout: {
    type: Date,
    required: true,
    default: new Date()
  },
  inProgress: {
    type: Boolean
  }
});

LoginSchema.statics.canAuthenticate = async function(key) {
  const login = await this.findOne({ identityKey: key });

  if(!login || login.failedAttempts < 5) {
    return true;
  }

  const timeout = (new Date() - addMinutes(new Date(login.timeout), 1));
  if (timeout >= 0) {
    await login.remove();
    return true;
  }

  return false;
}

LoginSchema.statics.failedLoginAttempt = async function(key) {
  const query = {identityKey: key};
  const update = {$inc: {failedAttempts: 1}, timeout: new Date()};
  const options = {setDefaultOnInsert: true, upsert: true};
  return this.findOneAndUpdate(query, update, options).exec();
}

LoginSchema.statics.successfulLoginAttempt = async function(key) {
  const login = await this.findOne({ identityKey: key });
  if (login) {
    return await login.remove();
  }
}

module.exports = mongoose.model('Login', LoginSchema);