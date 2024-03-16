const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

const dburl ="mongodb+srv://sunnykurmi:lkiDgeyjwa5IwMRx@cluster0.gl7jcp8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// const dburl = "mongodb://127.0.0.1:27017/nodetalk"

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(dburl, connectionParams)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB Atlas:", err.message);
  });

const userSchema = mongoose.Schema(
  {
    email: String,
    name: String,
    username: String,
    password: String,
    avatar: {
      type: Object,
      default: {
        fileld: "65cf434588c257da33da7c5f",
        url: "https://ik.imagekit.io/sunnykurmi/resumebuilder-1708081987208_0ybPK8mrY.png",
      },
    },
    status: {
      type: String,
      default: "0",
    },
  },
  { timestamps: true }
);

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);
