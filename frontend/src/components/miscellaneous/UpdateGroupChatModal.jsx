import { ViewIcon } from '@chakra-ui/icons'
import { Button, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useToast, Box, FormControl, Input, Spinner } from '@chakra-ui/react';
import { useDisclosure } from '@chakra-ui/react';
import React, { useState } from 'react'
import axios from 'axios';
import { ChatState } from '../../Context/ChatProvider';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';
import UserListItem from '../UserAvatar/UserListItem';

function UpdateGroupChatModal({ fetchAgain, setFetchAgain, fetchMessages }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState("");
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameLoading, setRenameLoading] = useState(false);
    const toast = useToast();
    const { selectedChat, setSelectedChat, user } = ChatState();

    const handleAddUser = async (user1) => {
        if (selectedChat.users.find((u) => u._id === user1._id)) {
            toast({
                title: "User Already in the Group",
                status: "error",
                duration: 5000,
                isclosable: true,
                position: "bottom"
            });
            console.log(selectedChat, u, user1)
            return;
        }
        if (selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: "Only admins can add someone",
                status: "error",
                duration: 5000,
                isclosable: true,
                position: "bottom"
            });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put('/api/chat/groupadd', {
                chatId: selectedChat._id,
                userId: user1._id
            }, config);

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isclosable: true,
                position: "bottom"
            });
            setLoading(false);
        }
    }
    const handleRemove = async (user1) => {
        if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
            toast({
                title: "Only admins can remove someone",
                status: "error",
                duration: 5000,
                isclosable: true,
                position: "bottom"
            });
            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    AuthoriZation: `Bearer ${user.token}`
                }
            };
            const { data } = await axios.put('api/chat/groupremove', {
                chatId: selectedChat._id,
                userId: user1._id
            }, config);
            user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            fetchMessages();
            setLoading(false);

        } catch (error) {
            toast({
                title: "Only admins can remove someone",
                status: "error",
                duration: 5000,
                isclosable: true,
                position: "bottom"
            });
        }
    }
    const handleRename = async () => {
        if (!groupChatName) return;

        try {
            setRenameLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };
            // console.log(config);
            const { data } = await axios.put('/api/chat/renamegroup', {
                chatId: selectedChat._id,
                chatName: groupChatName
            }, config);
            // console.log(data)
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setRenameLoading(false);
        } catch (error) {
            // console.log(error)
            toast({
                title: "Error occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isclosable: true,
                position: "bottom"
            });
            setRenameLoading(false);
        }
        setGroupChatName("");
    }
    const handleSearch = async (query) => {
        if (!query) {
            toast({
                title: "Please enter something in search",
                status: "warning",
                duration: 5000,
                isclosable: true,
                position: "top-left"
            });
            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`/api/user?search=${query}`, config);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: "Error occured!",
                description: "Failed to load the search results",
                status: "error",
                duration: 5000,
                isclosable: true,
                position: "bottom-left"
            });
        }
    }
    return (
        <>
            <IconButton display={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontFamily="Work sans"
                        fontSize="35px"
                        display="flex"
                        justifyContent="center"
                    >{selectedChat.chatName}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display="flex" flexDir="column" alignItems="center">
                        <Box
                            w="100%"
                            display="flex"
                            flexWrap="wrap"
                            pb={3}
                        >
                            {selectedChat.users.map((u) => (
                                user._id !== u._id && (
                                    <UserBadgeItem
                                        key={u._id}
                                        user={u}
                                        admin={selectedChat.groupAdmin}
                                        handleFunction={() => handleRemove(u)}
                                    />
                                )
                            ))}
                        </Box>
                        <FormControl display="flex">
                            <Input
                                placeholder='Chat Name'
                                mb={3}
                                value={groupChatName}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                            <Button
                                variant="solid"
                                colorScheme="teal"
                                ml={1}
                                isLoading={renameLoading}
                                onClick={() => handleRename()}
                            >Update</Button>
                        </FormControl>
                        <FormControl display="flex">
                            <Input
                                placeholder='Add User to Group'
                                mb={3}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </FormControl>
                        {loading ? (
                            <Spinner size="lg" />
                        ) : (
                            searchResult?.map(user => (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => handleAddUser(user)}
                                />
                            ))
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            colorScheme="red"
                            ml={1}
                            onClick={() => handleRemove(user)}
                        >Leave Group</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default UpdateGroupChatModal