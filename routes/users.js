import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import mongoose from "mongoose";
import Users from "../models/user.js";
import auth from '../middleware/auth.js'


const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const data = await User.find();
        res.status(200).json(data);
  } catch (e) {
    res.status(500).json(e);
  }
});

router.patch("/:email", async (req, res) => {
  const { email } = req.params;
  const post = req.body
  const updatePost = await Users.findOneAndUpdate(
   {email:email},
   post,
  );

  res.json(updatePost);
});

router.post("/singin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser)
      return res.status(404).json({ message: "User Doesn't exist." });

    const isPasswordCurrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCurrect)
      return res.status(400).json("Invalid Creadentials.");

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      "test",
      { expiresIn: "1h" }
    );

    res.status(200).json({ results: existingUser, token });
  } catch {
    res.status(500).json({ message: "Something Went Worng" });
  }
});

router.post("/singup", async (req, res) => {
  const { email, password, firstName, lastName, confirmPassword } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.status(404).json({ message: "User already exist." });

    if (password !== confirmPassword)
      return res.status(404).json({ message: "Password don't match" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const results = await User.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
      
    });

    const token = jwt.sign({ email: results.email, id: results._id }, "test", {
      expiresIn: "1h",
    });

    res.status(200).json({ results: results, token });
  } catch {
    res.status(500).json({ message: "Something Went Worng" });
  }
});

router.patch('/:id/follow',auth , async (req , res) =>{
  const {id: _id} = req.params; 

  if(!req.userId) return res.json({message:'Unauthenticated'})
  
  if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No Post With That Id')
  
  const user = await Users.findById(_id );

  const index = user.follow.findIndex((id)=> id === String(req.userId))

  if(index === -1){
    user.follow.push(req.userId)
  }else{
    user.follow = user.follow.filter((id) => id !== String(req.userId) )

  }

  const updateUser = await Users.findByIdAndUpdate(_id ,user , {new:true});

  
  res.json(updateUser)
  })

export default router;
