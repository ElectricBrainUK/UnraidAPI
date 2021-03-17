import Head from 'next/head';
import {
  Flex,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Button,
  VStack,
  Heading,
} from '@chakra-ui/react';
import React, { useState } from 'react';

export default function Home() {
  return (
    <Flex p="1rem">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <LoginForm />
      <GetServerDetails />
    </Flex>
  );
}

function GetServerDetails() {
  const getDetails = async () => {
    try {
      const resp = await fetch('/api/servers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const body = await resp.json();
      console.log(body);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <Flex>
      <Button onClick={getDetails}>Go</Button>
    </Flex>
  );
}

function LoginForm() {
  const [ip, setIp] = useState('');
  const [https, setHttps] = useState(false);
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ip, https, user, password };
      const resp = await fetch('/api/auth', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const body = await resp.json();
      console.log(body);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Flex
      flexDir="column"
      borderRadius="md"
      backgroundColor="gray.700"
      p="1rem"
    >
      <Heading size="md">Setup Unraid Server</Heading>

      <Flex flexDir="column" as="form" onSubmit={onSubmit}>
        <VStack>
          <FormControl id="serverIp">
            <FormLabel>Server IP</FormLabel>
            <Input type="text" onChange={(e) => setIp(e.target.value)} />
          </FormControl>
          <FormControl id="https">
            <Checkbox isChecked={https} onChange={() => setHttps(!https)}>
              Use HTTPS
            </Checkbox>
          </FormControl>
          <FormControl id="user">
            <FormLabel>User</FormLabel>
            <Input type="text" onChange={(e) => setUser(e.target.value)} />
          </FormControl>
          <FormControl id="password">
            <FormLabel>Password</FormLabel>
            <Input type="text" onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
          <FormControl display="flex" justifyContent="flex-end">
            <Button colorScheme="blue" type="submit">
              Login
            </Button>
          </FormControl>
        </VStack>
      </Flex>
    </Flex>
  );
}
