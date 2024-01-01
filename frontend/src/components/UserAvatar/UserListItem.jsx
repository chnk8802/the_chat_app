import React from 'react'
import { Avatar, Box, Text } from '@chakra-ui/react';

function UserListItem({ user, handleFunction }) {
    return (
        <Box
            onClick={handleFunction}
            cursor="pointer"
            bg="#e8e8e8"
            _hover={{
                background: "#38B2AC",
                color: "white"
            }}
            w="100%"
            display="flex"
            px={3}
            py={2}
            mb={2}
            borderRadius="lg"
        >
            <Avatar
                my="auto"
                mr={2}
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic} />
            <Box>
                <Text>{user.name}</Text>
                <Text fontSize="xs"><b>Email : </b>{user.email}</Text>
            </Box>
        </Box>
    )
}

export default UserListItem