const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
    senderid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    receiverid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    message:{
        type:String,
        // required:true
    },
    image: {
        type: Object,
        default: {
          fileld: "",
          url: "",
        },
      }, 
},{ timestamps :true })

module.exports = mongoose.model("chat", chatSchema);