import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider';
import { Stack, Box, Button, Text, useToast } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import ChatLoading from './ChatLoading';
import { getSender } from '../config/ChatLogics';
import GroupChatModal from './miscellaneous/GroupChatModal';

function MyChats({ fetchAgain, setFetchAgain }) {
    const [loggedUser, setLoggedUser] = useState();
    const { user, selectedChat, setSelectedChat, chats, setChats } = ChatState();
    const toast = useToast();
    const fetchChats = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get('/api/chat', config);
            setChats(data);
        } catch (error) {
            toast({
                title: "Error occured!",
                description: "Failed to load chats",
                status: "error",
                duration: 5000,
                isclosable: true,
                position: "bottom-left"
            });
        }
    }

    useEffect(() => {
        setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
        fetchChats();
    }, [fetchAgain]);

    return (
        <Box
            display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
            flexDir="column"
            alignItems="center"
            p={3}
            bg="white"
            w={{ base: "100%", md: "31%" }}
            borderRadius="lg"
            borderWidth="1px"
        >
            <Box
                pb={3}
                px={3}
                fontFamily="Work sans"
                display="flex"
                flexDirection={{ base: "row", md: "Column", lg: "row" }}
                w="100%"
                justifyContent="space-between"
                alignItems="center"
            >
                <Text
                    fontSize={{ base: "24px", md: "30px" }}
                >
                    My Chats
                </Text>
                <GroupChatModal fetchChats={fetchChats}>
                    <Button
                        display="flex"
                        fontSize={{ base: "14px", md: "17px", lg: "17px" }}
                        rightIcon={<AddIcon />}
                    >
                        New Group Chat
                    </Button>
                </GroupChatModal>
            </Box>

            <Box
                display="flex"
                flexDir="column"
                p={3}
                bg="#f8f8f8"
                w="100%"
                h="100%"
                borderRadius="lg"
                overflowY="hidden"
            >
                {
                    chats ? (
                        <Stack overflowY="scroll">
                            {chats.map((chat) => (
                                <Box
                                    onClick={() => setSelectedChat(chat)}
                                    cursor="pointer"
                                    bg={selectedChat == chat ? "#38B2AC" : "#E8E8E8"}
                                    color={selectedChat == chat ? "white" : "black"}
                                    px={3}
                                    py={2}
                                    borderRadius="lg"
                                    key={chat._id || Math.random()}
                                >
                                    <Text>
                                        {!chat.isGroupChat && chat.users ?
                                            getSender(loggedUser, chat.users)
                                            : "👥 " + chat.chatName}
                                    </Text>
                                </Box>
                            ))}
                        </Stack>
                    ) : (
                        <ChatLoading />
                    )
                }
            </Box>
        </Box>
    )
}

export default MyChats