import React from 'react';
import axios from 'axios';
import { useState } from 'react';
import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack } from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

function Signup() {
    const [show, setShow] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState();
    const [confirmPassword, setConfirmPassword] = useState();
    const [pic, setPic] = useState();
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    const handleClick = () => setShow(!show);
    const postDetails = (pics) => {
        setLoading(true);
        if (pics === undefined) {
            toast({
                title: 'Please select an image!',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });
            return;
        };
        if (pics.type === 'image/jpeg' || pics.type === 'image/png') {
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", "chat-APP");
            data.append("cloud_name", "deh0mdcfr");
            axios.post("https://api.cloudinary.com/v1_1/deh0mdcfr/image/upload", data)
                .then((response) => {
                    console.log("Cloudinary response:", response);
                    setPic(response.data.url.toString());
                    setLoading(false);
                    toast({
                        title: "Image uploaded successfully!",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom",
                    });
                })
                .catch((error) => {
                    console.log("Cloudinary error:", error);
                    setLoading(false);
                });
        } else {
            toast({
                title: "Please select an image!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });
            setLoading(false);
            return;
        }
    };
    const submitHandler = async () => {
        setLoading(true);
        if (!name || !email || !password || !confirmPassword) {
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
        if (password !== confirmPassword) {
            toast({
                title: "Please enter same password in confirm password!",
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
            const { data } = await axios.post('/api/user', {
                name,
                email,
                password
            },
                config
            );
            toast({
                title: "Registration successful!",
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
            <FormControl id='firstName' isRequired>
                <FormLabel>Name</FormLabel>
                <Input placeholder='Enter your name' onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input type='email' placeholder='your-email@example.com' onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            <FormControl id='password' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input type={show ? "text" : "password"} placeholder='Enter a password' onChange={(e) => setPassword(e.target.value)} />
                    <InputRightElement>
                        <Button h="1.75rem" size="sm" onClick={handleClick} >
                            {show ? <ViewIcon /> : <ViewOffIcon />}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <FormControl id='confirmPassword' isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                    <Input type={show ? 'text' : 'password'} placeholder='Enter your password again' onChange={(e) => setConfirmPassword(e.target.value)} />
                    <InputRightElement>
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                            {show ? <ViewIcon /> : <ViewOffIcon />}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <FormControl id='pic'>
                <FormLabel>Upload Your picture</FormLabel>
                <Input type='file' p={1.5} accept='image/*' onChange={(e) => postDetails(e.target.files[0])} />
            </FormControl>
            <Button colorScheme='blue' w='100%' style={{ margin: 15 }} onClick={submitHandler} isLoading={loading}>Sign Up</Button>
        </VStack>
    )
}

export default Signup