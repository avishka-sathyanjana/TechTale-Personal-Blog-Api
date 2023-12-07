const mongoose = require('mongoose');

const {Schema,model} = mongoose;

const PostSchema = new Schema({
  title:String,
  summary:String,
  content:String,
  cover:String,
  // to get the name of the author
  author:{type:Schema.Types.ObjectId, ref:'User'},
}, {
    // to get the time created
  timestamps: true,
});

const PostModel = model('Post', PostSchema);

module.exports = PostModel;