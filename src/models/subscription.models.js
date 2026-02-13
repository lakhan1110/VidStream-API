/* id string pk
  subscriber ObjectId users
  channel ObjectId users
  createdAt Date
  updatedAt Date
  */

import mongoose , { Schema } from "mongoose"    

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true  
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true }
)


export const Subscription = mongoose.model("Subscription", subscriptionSchema)