import { Button, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { AuthContext, pb } from '../lib/pb';
import { useNavigate } from 'react-router-dom';
import { Header } from '../lib/components';
import { use, useEffect } from 'react';


export function LoginPage() {
    const navigate = useNavigate();
    const user = use(AuthContext)
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            email: '',
            password: '',
        },

        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            password: (value) => (value ? null : 'Invalid password'),
        },
    });
    console.log(user)
    if (user) {
        useEffect(() => { navigate("/") }, [])
        return
    }
    return (
        <>
            <a href='/'>{"< Home"}</a>
            <Header>
                Login
            </Header>
            <form className='flex flex-col gap-2' onSubmit={form.onSubmit(async (values) => {
                await pb.collection("users").authWithPassword(values.email, values.password);
                navigate("/")
            })}>
                <TextInput
                    withAsterisk
                    label="Email"
                    placeholder="your@email.com"
                    key={form.key('email')}
                    {...form.getInputProps('email')}
                />
                <TextInput
                    withAsterisk
                    label="password"
                    placeholder="your password"
                    key={form.key('password')}
                    className='mb-6'
                    {...form.getInputProps('password')}
                />
                <Button type="submit">Submit</Button>
            </form>
        </>
    );
}