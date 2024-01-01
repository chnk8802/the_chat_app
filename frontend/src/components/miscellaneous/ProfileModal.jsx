import { ViewIcon } from '@chakra-ui/icons'
import { Button, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Image, Text, useDisclosure } from '@chakra-ui/react'
import React from 'react'

function ProfileModal({ user, children }) {
    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <>
            {
                children ? (<span onClick={onOpen}>{children}</span>) : (
                    <IconButton display={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
                )
            }
            <Modal size="lg" isCentered isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent h="410px">
                    <ModalHeader fontSize="40px" fontFamily="Work sans" display="flex" justifyContent="center">{user.name}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display="flex" flexDir="column" alignItems="center" justifyContent="space-between">
                        <Image
                            borderRadius='full'
                            boxSize='150px'
                            aspectRatio="1:1"
                            src={user.pic}
                            alt={user.name}
                        />
                        <Text
                            fontSize={{ base: "20px", md: "22px" }}
                            fontFamily="Work sans">
                            Email: {user.email}
                        </Text>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default ProfileModal