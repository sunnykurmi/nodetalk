var express = require("express");
var router = express.Router();
const userModel = require("./users");
const chatModel = require("./chat");
const fs = require("fs");
const passport = require("passport");
const path = require("path");
const imagekit = require("./imagekit").initImagekit();

const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login", // Corrected from failuredRedirect to failureRedirect
    failureFlash: true,
  }),
  function (req, res, next) {}
);

router.post("/register", async function (req, res, next) {
  try {
    const foundUser = await userModel.findOne({ username: req.body.username });

    if (foundUser) {
      // User with the same username already exists
      return res.send("Username already exists");
    }

    // Create a new user
    const newUser = new userModel({
      email: req.body.email,
      username: req.body.username,
      name: req.body.name,
    });

    // Register the new user
    const registeredUser = await userModel.register(newUser, req.body.password);

    // Authenticate the user
    req.login(registeredUser, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect("/");
    });
  } catch (error) {
    console.error("Error in registration:", error.message);
    return res.status(500).send("Internal Server Error");
  }
});

router.get("/", isLoggedIn, function (req, res, next) {
  userModel
    .findOne({ username: req.session.passport.user })
    .then(function (loggedinuser) {
      userModel
        .find({ username: { $ne: req.session.passport.user } })
        .then(function (allusers) {
          res.render("index", { allusers, loggedinuser });
        });
    })
    .catch(function (error) {
      console.error("Error finding users:", error);
      res.status(500).send("Internal Server Error");
    });
});

router.get("/login", function (req, res, next) {
  res.render("login", { error: req.flash("error") });
});
router.get("/signup", function (req, res, next) {
  res.render("signup", { error: req.flash("error") });
});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/login");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}
router.post("/chat", async function (req, res, next) {
  try {
    const senderUser = await userModel.findById(req.body.senderid);
    if (!senderUser) {
      return res.json({ success: false, error: "Sender user not found" });
    }
    const chat = new chatModel({
      senderid: req.body.senderid,
      receiverid: req.body.receiverid,
      message: req.body.message,
    });
    const newchat = await chat.save();
    res.json({
      success: true,
      data: {
        chatId: newchat._id,
        message: newchat,
        senderImage: senderUser.avatar.url,
      },
    });
  } catch (error) {
    next(error);
  }
});


router.post("/chat2", async function (req, res, next) {
  try {
    const senderUser = await userModel.findById(req.body.senderid);
    if (!senderUser) {
      return res.json({ success: false, error: "Sender user not found" });
    }

    // Upload image to ImageKit
    const modifyfilename = `image-${Date.now()}`;
    const { fileId, url } = await imagekit.upload({
      file: req.files.image.data, // Assuming you have middleware to handle file uploads
      fileName: modifyfilename,
    });
    const chat = new chatModel({
      senderid: req.body.senderid,
      receiverid: req.body.receiverid,
      message: req.body.message,
      image: { fileId, url }, // Store image information in the database
    });
    const newchat = await chat.save();
    res.json({
      success: true,
      data: {
        chatId: newchat._id,
        message: newchat,
        image: newchat.image,
        senderImage: senderUser.avatar.url,
      },
    });
  } catch (error) {
    next(error);
  }
});


router.get("/editprofile", isLoggedIn, function (req, res, next) {
  userModel
    .findOne({ username: req.session.passport.user })
    .then(function (loggedinuser) {
      res.render("editprofile", { loggedinuser });
    })
    .catch(function (error) {
      console.error("Error finding user:", error);
      res.status(500).send("Internal Server Error");
    });
});

router.post("/update", isLoggedIn, function (req, res, next) {
  userModel
    .findOne({ username: req.session.passport.user })
    .then(function (loggedinuser) {
      loggedinuser.name = req.body.name;
      loggedinuser.username = req.body.username;
      loggedinuser.email = req.body.email;
      loggedinuser.save();
      res.redirect("back");
    })
    .catch(function (error) {
      console.error("Error finding user:", error);
      res.status(500).send("Internal Server Error");
    });
});

router.post("/uploadavatar", isLoggedIn, (req, res, next) => {
  userModel
    .findOne({ username: req.session.passport.user })
    .then(async function (loggedinuser) {
      try {
        const file = req.files.avatar;
        console.log(file);

        //delete previous avatar
        // if (loggedinuser.avatar.fileId !== "") {
        //   await imagekit.deleteFile(loggedinuser.avatar.fileId);
        // }
        const modifyfilename = `avatar-${Date.now()}`;
        const { fileld, url } = await imagekit.upload({
          file: file.data,
          fileName: modifyfilename,
        });
        loggedinuser.avatar = { fileld, url };
        await loggedinuser.save();
        res.redirect("back");
      } catch (error) {
        console.error("Error uploading avatar:", error);
        res.status(500).send("Internal Server Error");
      }
    })
    .catch(function (error) {
      console.error("Error finding user:", error);
      res.status(500).send("Internal Server Error");
    });
});

module.exports = router;
