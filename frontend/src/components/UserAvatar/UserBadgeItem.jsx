import { CloseIcon } from '@chakra-ui/icons'
import { Box } from '@chakra-ui/react'
import React from 'react'

function UserBadgeItem({ user, handleFunction }) {
    return (
        <Box
            px={2}
            py={1}
            borderRadius="lg"
            m={1}
            mb={2}
            variant="solid"
            fontSize={14}
            bg="#38B2AC"
            cursor="pointer"
            color="white"
            onClick={handleFunction}

        >{user.name}<CloseIcon mx={2} fontSize="8px" /></Box>
    )
}

export default UserBadgeItem