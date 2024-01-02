import React, { useState } from 'react'
import { Box, Button, Tooltip, Text, Menu, MenuButton, MenuList, CheckboxGroup, Avatar, MenuItem, Drawer, useDisclosure, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Input, useToast, Spinner } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import Badge from '@mui/material/Badge';
import { Badge as ChakraBadge } from '@chakra-ui/react';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { ChatState } from '../../Context/ChatProvider';
import ProfileModal from './ProfileModal';
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { getSender } from '../../config/ChatLogics';

function SideDrawer() {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState();
    const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        navigate('/');
    }
    const handleSearch = async () => {
        if (!search) {
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
            const { data } = await axios.get(`/api/user?search=${search}`, config);
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
    const accessChat = async (userId) => {
        try {
            setLoadingChat(true);
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                }
            };
            const { data } = await axios.post('/api/chat', { userId }, config);

            if (!chats.find((c) => c._id === data._id)) setChats([data], ...chats);

            setSelectedChat(data)
            setLoadingChat(false)
            onClose();
        } catch (error) {
            toast({
                title: "Error fetching chat!",
                description: error.message,
                status: "error",
                duration: 5000,
                isclosable: true,
                position: "bottom-left"
            });
        }
    }
    const handleClose = () => {
        setSearch("");
        setSearchResult([])
        onClose();
    }

    return (
        <>
            <Box
                display="flex"
                justifyContent='space-between'
                alignContent='center'
                bg='white'
                w='100%'
                p='5px 10px'
                borderWidth='5px'
            >
                <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
                    <Button variant='ghost' borderWidth='1px' onClick={onOpen}>
                        <i className="fa fa-search" aria-hidden="true"></i>
                        <Text display={{ base: "none", md: "flex" }} px='4'>Search User</Text>
                    </Button>
                </Tooltip>
                <Text fontSize='2xl' fontFamily='work-sans'>The Chat App</Text>
                <div>
                    <Menu>
                        <MenuButton p={1}>
                            <Box>
                                <ChakraBadge style={{ backgroundColor: "#e60707", color: "white", position: "absolute" }}>{notification.length != 0 ? (notification.length > 99 ? "99+" : notification.length) : ""}
                                </ChakraBadge>
                                <BellIcon fontSize="2xl" m={1} />
                            </Box>
                            <MenuList>
                                {!notification.length && "No new Messages"}
                                {notification.map((noti) => (
                                    <MenuItem
                                        key={noti._id}
                                        onClick={() => {
                                            setSelectedChat(noti.chat);
                                            setNotification(notification.filter((n) => n !== noti))
                                        }}
                                    >
                                        {noti.chat.isGroupChat ? `New Message in ${noti.chat.chatName}` : `New Message from ${getSender(user, noti.chat.users)}`}
                                    </MenuItem>
                                ))}
                            </MenuList>
                        </MenuButton>
                    </Menu>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                            <Avatar size='sm' cursor='pointer' name={user.name} src={user.pic} />
                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModal>
                            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>
            <Drawer placement='left' onClose={() => handleClose()} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
                    <DrawerBody>
                        <Box display='flex' pb={2}>
                            <Input
                                placeholder="Search by name or email"
                                mr={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button onClick={handleSearch}>Go</Button>
                        </Box>
                        {loading ? (<ChatLoading />) : (
                            searchResult?.map(user =>
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => accessChat(user._id)} />)
                        )}
                        {loadingChat && <Spinner ml="auto" display="flex" />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    )
}

export default SideDrawer