import mongoose from "mongoose";

const userSchema =  mongoose.Schema({
   name:{type: String , required: true},
   email:{type: String , required: true},
   password:{type: String , required: true},
   id: String,
   saved:[String],
   description:String,
   follow: {
      type: [String],
      default: [],
    } ,
   follower : {
      type: [String],
      default: [],
    },
   profileImg:String,
})

//   export default  mongoose.model('user', userSchema)

  const Users = mongoose.model('users',userSchema)

  export default  Users