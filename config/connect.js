import mongoose from "mongoose";

let connectDB = url => {
    return mongoose.connect(url)
}

export default connectDB