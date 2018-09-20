var mongoose= require('mongoose');
mongoose.connect(process.env.MONGO_URI);

var Schema = mongoose.Schema;

var userSchema = new Schema ({
  username: {
    type: String,
    required: true
  }
});
var user = mongoose.model('user', userSchema);

var exerciseSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type:Number,
    required: true
  },
  date: {
    type: Date,
    default: new Date(),
    required: true
  }
});
var exerciseModel= mongoose.model('exerciseModel', exerciseSchema);

var createUser = function(username, done){
  user.create({username: username}, function(err, data){
    if (err) return done(err);
    done(null,data);
  });
}

var findUser = function(username, done){
  user.findOne({username: username}, function(err,data){
    if (err) return done(err);
    done(null,data);
  });
};

var findAllUsers = function(done){
  user.find({},function(err,data){
    if (err) return done(err);
    done(null,data);
  });
}

var createExercise = function(exercise , done){
  exerciseModel.create({userId: exercise.userId, description: exercise.description, duration: exercise.duration , date: exercise.date}, function(err,data){
    if (err) return done(err);
    done(null,data);
  });
}

var findUserById = function (id , done){
  user.findById(id, function(err, data){
    if (err) return done(err);
    done(null, data);
  });
}

exports.user= user;
exports.createUser= createUser;
exports.findUser= findUser;
exports.findAllUsers= findAllUsers;
exports.exerciseModel= exerciseModel;
exports.createExercise= createExercise;
exports.findUserById= findUserById;