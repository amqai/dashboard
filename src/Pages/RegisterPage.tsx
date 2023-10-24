import "../styles/login.css";
import "../styles/common.css";
import { Alert, Button, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import AmqParticles from "../Components/AmqParticles";

function RegisterPage() {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    const submit = async (values: { email: string; password: string }) => {
        const { email, password } = values;
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email,
                password,
            })
        });
        const data = await response.json();
        if (data.errorCode) {
            setErrorMessage(data.errorMessage)
        } else {
            localStorage.setItem('jwt', data.token);
            await navigate('/')
        }
    }

    const dismissAlert = () => {
        setErrorMessage("");
    };

    function handleLoginPage() {
        navigate('/login')
    }

    return(
        <div className="background">
            <AmqParticles />
            <div className="logowrapper">
                <div className="logocontainer"/>
                <Form className="loginform" onFinish={submit}>
                    {errorMessage !== "" && (
                        <div className="erroralert">
                        <Alert message={errorMessage} onClose={dismissAlert} type="error" closable={true} />
                        </div>
                    )}
                    <Typography.Title level={3} style={{width: "100%"}}>Create an account</Typography.Title>
                    <p style={{width: "100%"}}>
                        Already have an account? <a onClick={handleLoginPage}>Login here</a>
                    </p>
                    <Form.Item
                        name={"email"}
                        rules={[
                            {
                            required: true,
                            type: "email",
                            message: "Please enter valid email",
                            }
                        ]}
                    >                  
                    <Input placeholder="Enter a email" size="large" />
                    </Form.Item>
                    <Form.Item
                        name={"password"}
                        rules={[
                            {
                            required: true,
                            }
                        ]}
                    >                  
                    <Input.Password placeholder="Enter your password" size="large" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block size="large">Register</Button>
                </Form>
            </div>
        </div>
    )
}

export default RegisterPage;