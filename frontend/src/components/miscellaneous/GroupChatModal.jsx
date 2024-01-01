import React from 'react'
import axios from 'axios';
import { useState } from 'react';
import {
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    ModalContent,
    useDisclosure,
    Button,
    useToast,
    FormControl,
    Input,
    Box
} from '@chakra-ui/react'
import { ChatState } from '../../Context/ChatProvider';
import UserListItem from '../UserAvatar/UserListItem'
import UserBadgeItem from '../UserAvatar/UserBadgeItem';

function GroupChatModal({ children, fetchChats }) {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState("");
    const [selectedUser, setSelectedUser] = useState([]);
    const [search, SetSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState();
    const toast = useToast();
    const { user, chats, setChats } = ChatState();

    const handleSearch = async (query) => {
        SetSearch(query);
        if (!query) {
            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            // console.log(search, "++++++++++====", query)
            const { data } = await axios.get(`/api/user?search=${query}`, config);
            // console.log(data);
            setLoading(false);
            setSearchResult(data);
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
    };
    const handleSubmit = async () => {
        if (!groupChatName || !selectedUser) {
            toast({
                title: "Please fill all the forms!",
                status: "warning",
                duration: 5000,
                isclosable: true,
                position: "top"
            });
            return;
        }
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post(`/api/chat/group`, {
                name: groupChatName,
                users: JSON.stringify(selectedUser.map((u) => u._id))
            }, config);
            setChats([data, ...chats]);
            onClose();
            toast({
                title: "Group Chat created successfully!",
                status: "success",
                duration: 5000,
                isclosable: true,
                position: "bottom"
            });
        } catch (error) {
            toast({
                title: "Failed to create chat!",
                description: error.reaponse.data,
                status: "error",
                duration: 5000,
                isclosable: true,
                position: "bottom"
            });
        }
        fetchChats();
    };
    const handleGroup = (userToAdd) => {
        if (selectedUser.includes(userToAdd)) {
            toast({
                title: "User already added!",
                status: "warning",
                duration: 5000,
                isclosable: true,
                position: "top"
            });
            return;
        }
        setSelectedUser([...selectedUser, userToAdd]);
    };
    const handleDelete = (delUser) => {
        setSelectedUser(selectedUser.filter((sel) => sel._id !== delUser._id))
    };
    return (
        <>
            <span onClick={onOpen}>{children}</span>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Chat Group</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody
                        display="flex"
                        flexDir="column"
                        alignItems="center"
                    >
                        <FormControl>
                            <Input placeholder='Chat Name' mb={3} onChange={(e) => setGroupChatName(e.target.value)} />
                        </FormControl>
                        <FormControl>
                            <Input placeholder='Add User eg: Ramesh, Lakhbeer, Ismail, Micheal' mb={1}
                                onChange={(e) => handleSearch(e.target.value)} />
                        </FormControl>
                        <Box
                            w="100%%"
                            display="flex"
                            flexWrap="wrap">
                            {selectedUser?.map((u) => (
                                <UserBadgeItem
                                    key={u._id}
                                    user={u}
                                    handleFunction={() => handleDelete(u)}
                                />
                            ))}
                        </Box>
                        {loading ? (
                            <div>Loading...</div>
                        ) : (searchResult?.slice(0, 2).map((user) => (
                            <UserListItem
                                key={user._id}
                                user={user}
                                handleFunction={() => handleGroup(user)} />)))}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue' onClick={handleSubmit}>
                            Create Chat
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default GroupChatModal