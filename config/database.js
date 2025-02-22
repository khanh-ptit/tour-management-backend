const mongoose = require("mongoose");

module.exports.connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Sucessfully connected");
  } catch {
    console.log("Error! Please try again");
  }
};
