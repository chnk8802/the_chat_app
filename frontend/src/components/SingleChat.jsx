import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { io } from 'socket.io-client';
import { Box, IconButton, Text, Spinner, FormControl, Input, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { ChatState } from '../Context/ChatProvider';
import { getSender, getSenderFull } from '../config/ChatLogics';
import ProfileModal from '../components/miscellaneous/ProfileModal';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import ScrollableChat from '../components/ScrollableChat';
import '../components/styles.css';
import Lottie from 'lottie-react';
import typingAnimationData from '../animations/typing.json'

const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

function SingleChat({ fetchAgain, setFetchAgain }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("")
    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const toast = useToast();
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: typingAnimationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };
    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };
            const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
            // console.log(messages);
            setMessages(data);
            setLoading(false);
            socket.emit('join chat', selectedChat._id)
        } catch (error) {
            // console.log(error)
            toast({
                title: "Error occured!",
                description: "Failed to load the messages",
                status: "error",
                duration: 5000,
                isclosable: true,
                position: "bottom"
            });
        }
    };


    useEffect(() => {
        if (!socket) {
            socket = io(ENDPOINT);
            socket.emit('setup', user);
            socket.on('connected', () => setSocketConnected(true));
            socket.on('typing', () => setIsTyping(true));
            socket.on('stop typing', () => setIsTyping(false));
        }
        return () => {
            // Clean up socket when the component unmounts
            if (socket) {
                socket.disconnect();
                socket = null;
            }
        };
    }, [user]);

    useEffect(() => {
        fetchMessages();

        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        socket.on('message received', (newMessageReceived) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
                if (!notification.includes(newMessageReceived)) {
                    setNotification([newMessageReceived, ...notification]);
                    setFetchAgain(!fetchAgain);
                }

            } else {
                setMessages([...messages, newMessageReceived])
            }
        })
    });

    const sendMessage = async (event) => {
        if (event.key === "Enter" && newMessage) {
            socket.emit('stop typing', selectedChat._id);
            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`
                    }
                };
                setNewMessage("");
                const { data } = await axios.post("/api/message", {
                    content: newMessage,
                    chatId: selectedChat._id,
                }, config);
                // console.log(data);
                socket.emit('new message', data)
                setMessages([...messages, data])
            } catch (error) {
                // console.log(error)
                toast({
                    title: "Error occured!",
                    description: "Failed to send the message",
                    status: "error",
                    duration: 5000,
                    isclosable: true,
                    position: "bottom"
                });
            }
        }
    };
    const typingHandler = (e) => {
        setNewMessage(e.target.value);
        // Typing indicator logic
        if (!socketConnected) return;
        if (!typing) {
            setTyping(true);
            socket.emit('typing', selectedChat._id)
        }
        let lastTypingTime = new Date().getTime();
        var timelength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timelength && typing) {
                socket.emit('stop typing', selectedChat._id);
                setTyping(false);
            }
        }, timelength);
    };

    return (
        <>{selectedChat ? (
            <>
                <Text
                    fontSize={{ base: "28px", md: "30px" }}
                    px={2}
                    py={2}
                    w="100%"
                    fontFamily="Work sans"
                    display="flex"
                    justifyContent={{ base: "space-between" }}
                    alignItems="center"
                >
                    <IconButton
                        display={{ base: "flex", md: "none" }}
                        // mt={4}
                        icon={<ArrowBackIcon />}
                        onClick={() => setSelectedChat("")}
                    />
                    {!selectedChat.isGroupChat ? (
                        <>
                            {getSender(user, selectedChat.users)}
                            <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                        </>
                    ) : (
                        <>
                            {selectedChat.chatName.toUpperCase()}
                            <UpdateGroupChatModal
                                fetchAgain={fetchAgain}
                                setFetchAgain={setFetchAgain}
                                fetchMessages={fetchMessages}
                            />
                        </>
                    )}
                </Text>
                <Box
                    display="flex"
                    flexDir="column"
                    justifyContent="flex-end"
                    p={3}
                    mb={2}
                    bg="#E8E8E8"
                    w="98%"
                    h="100%"
                    borderRadius="lg"
                    overflowY="hidden"
                >
                    {loading ?
                        (<Spinner
                            size="xl"
                            w={20}
                            h={20}
                            alignSelf="center"
                            margin="auto"
                        />) : (<div className="messages">
                            <ScrollableChat messages={messages} />
                        </div>)}
                    <FormControl onKeyDown={sendMessage} isRequired mt={3} >
                        {isTyping ? (
                            <Lottie
                                loop={true}
                                autoplay={true}
                                animationData={typingAnimationData}
                                style={{ width: "50px", marginBottom: "5px" }}
                                cellPadding={0}
                            />
                        ) : (
                            <></>
                        )}
                        <Input
                            variant="filled"
                            bg="#E0E0E0"
                            placeholder="Enter a message..."
                            value={newMessage}
                            onChange={typingHandler}
                        />
                    </FormControl>
                </Box>
            </>)
            :
            (<Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                h="100%"
            >
                <Text
                    fontSize="3xl"
                    pb={3}
                    fontFamily="Work sans"
                >Click on a user to start chatting.
                </Text>
            </Box>)
        }</>
    )
}

export default SingleChat