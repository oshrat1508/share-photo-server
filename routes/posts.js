import express from "express";
import PostMessage from "../models/postMesage.js";
import mongoose from "mongoose";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const postMessages = await PostMessage.find();
    res.status(200).json(postMessages);
  } catch (e) {
    res.status(404).json({ message: e });
  }
});

router.post("/", auth, async (req, res) => {
  const post = req.body;
  const newPost = new PostMessage({
    ...post,
    creator: req.userId,
    createdAt: new Date().toISOString(),
  });
  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (e) {
    res.status(404).json(e.messaga);
  }
});

router.patch("/:id", auth, async (req, res) => {
  const { id: _id } = req.params;
  const post = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No Post With That Id");
  const updatePost = await PostMessage.findByIdAndUpdate(_id, post, {
    new: true,
  });

  res.json(updatePost);
});

router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No Post With That Id");

  await PostMessage.findByIdAndRemove(id);

  res.json({ messaga: "deleted" });
});

router.patch("/:id/likePost", auth, async (req, res) => {
  const { id: _id } = req.params;

  if (!req.userId) return res.json({ message: "Unauthenticated" });

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No Post With That Id");

  const post = await PostMessage.findById(_id);

  const index = post.likes?.findIndex((id) => id === String(req.userId));

  if (index === -1) {
    post.likes.push(req.userId);
  } else {
    post.likes = post.likes?.filter((id) => id !== String(req.userId));
  }

  const updatePost = await PostMessage.findByIdAndUpdate(_id, post, {
    new: true,
  });

  res.json(updatePost);
});

export default router;
