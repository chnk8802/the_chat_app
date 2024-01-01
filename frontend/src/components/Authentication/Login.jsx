import React from 'react'
import axios from 'axios';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { FormControl, FormLabel, Input, InputGroup, InputRightElement, Button, VStack } from '@chakra-ui/react';
import { useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [show, setShow] = useState(false);
    const [name, setName] = useState();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    const handleClick = () => setShow(!show);
    const submitHandler = async () => {
        setLoading(true);
        if (!email || !password) {
            toast({
                title: "Please fill all required fields!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });
            setLoading(false);
            return;
        }

        try {
            const config = {
                header: {
                    "Content-type": "application/json"
                }
            };

            const { data } = await axios.post('/api/user/login', {
                email,
                password
            },
                config
            );

            toast({
                title: "Login successful!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });

            localStorage.setItem("userInfo", JSON.stringify(data));
            navigate('/chat');
        } catch (error) {
            console.log(error)
            toast({
                title: "Error occured!",
                description: error.typeError,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
    };
    return (
        <VStack spacing="5px">
            <FormControl id='email-login' isRequired>
                <FormLabel>Email</FormLabel>
                <Input type='email' placeholder='your-email@example.com' onChange={(e) => setEmail(e.target.value)} value={email} />
            </FormControl>
            <FormControl id='password-login' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input type={show ? "text" : "password"} placeholder='Enter a password' onChange={(e) => setPassword(e.target.value)} value={password} />
                    <InputRightElement>
                        <Button h="1.75rem" size="sm" onClick={handleClick} >
                            {show ? <ViewIcon /> : <ViewOffIcon />}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <Button colorScheme='blue' w='100%' style={{ margin: 15 }} onClick={submitHandler} isLoading={loading}>Log In</Button>
            <Button colorScheme='red' w='100%' onClick={() => { setEmail("guestuser@talkative.com"); setPassword("GuestUser@000") }} >Login as guest</Button>
        </VStack>
    )
}

export default Login