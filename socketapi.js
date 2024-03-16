const chatusermodel = require("./routes/users");
const chatuser = require("./routes/chat");
const io = require("socket.io")();
const webSocketServer = require("ws").Server;
const socketapi = {
  io: io,
};

// Add your socket.io logic here!
io.on("connection", async function (socket) {
  console.log("user connected");
  var token = socket.handshake.auth.token;
  await chatusermodel.findOneAndUpdate(
    { _id: token },
    { $set: { status: "1" } }
  );
  //user broadcast online status
  socket.broadcast.emit("online", { user_id: token });

  socket.on("disconnect", async function () {
    console.log("A user disconnected");
    var token = socket.handshake.auth.token;
    await chatusermodel.findOneAndUpdate(
      { _id: token },
      { $set: { status: "0" } }
    );
    socket.broadcast.emit("offline", { user_id: token });
  });
  socket.on("receiverchat", function (data) {
    socket.broadcast.emit("loadreceiverchat", data);
    // console.log(data);
  });
  socket.on("receiverimage", function (data) {
    socket.broadcast.emit("loadreceiverimage", data);
    // console.log(data);
  });

  socket.on("existschat", async function (data) {
    var chats = await chatuser.find({
      $or: [
        { senderid: data.senderid, receiverid: data.receiverid },
        { senderid: data.receiverid, receiverid: data.senderid },
      ],
    });
    socket.emit("loadchats", { chats });
  });
});
// end of socket.io logic

module.exports = socketapi;
