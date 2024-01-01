import expressAsyncHandler from "express-async-handler";
import Chat from '../models/chat.js'
import User from "../models/user.js";

const accessChat = expressAsyncHandler(async (req, res) => {
    const userId = req.body.userId;

    if (!userId) {
        res.sendStatus(400);
        return;
    }

    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } }
        ],
    }).populate("users", "-password")
        .populate("latestMessage");
    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email"
    });

    if (isChat.length > 0) {
        res.send(isChat[0]);
        return;
    } else {
        var chatData = {
            isGroupChat: false,
            users: [req.user._id, userId]
        }

    }

    try {
        const createdChat = await Chat.create(chatData);

        const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
        res.status(200).send(fullChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const fetchChat = expressAsyncHandler(async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate('users', '-password')
            .populate('groupAdmin', '-password')
            .populate('latestMessage')
            .sort({ updatedAt: -1 })
            .then(async (result) => {
                result = await User.populate(result, {
                    path: 'latestMessage.sender',
                    select: 'name pic email'
                });
                res.status(200).send(result)
            });
    } catch (error) {
        throw new Error(error.message)
    }
});

const createGroup = expressAsyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        res.status(400).send('Please fill all the fields!');
    }

    var users = JSON.parse(req.body.users);

    if (users.length < 2) {
        throw new Error('More than 2 users are required to form a group  chat');
    }

    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });
        const fullGroupChat = await Chat.find({ _id: groupChat._id })
            .populate('users', '-password')
            .populate('groupAdmin', '-password');
        res.status(200).send(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message)

    }
});

const renameGroup = expressAsyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;

    const updateChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName,
        },
        {
            new: true
        }
    )
        .populate('users', '-password')
        .populate('groupAdmin', '-password')

    if (!updateChat) {
        res.status(400);
        throw new Error('Chat group not found');
    } else {
        res.json(updateChat)
    }
});

const addTogroup = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    const added = await Chat.findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true })
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

    if (!added) {
        res.status(404);
        throw new Error('Chat not found!');
    } else {
        res.json(added);
    }
});

const removeFromGroup = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    const removed = await Chat.findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true })
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

    if (!removed) {
        res.status(404);
        throw new Error('Chat not found!');
    } else {
        res.json(removed);
    }
});

export default { accessChat, fetchChat, createGroup, renameGroup, addTogroup, removeFromGroup } 