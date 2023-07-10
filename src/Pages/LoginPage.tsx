import "../styles/login.css";
import "../styles/common.css";
import { Alert, Button, Divider, Form, Input, Typography } from 'antd';
import logo from '../assets/logo.png';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    const submit = async (values: { username: string; password: string }) => {
        const { username, password } = values;
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/authenticate`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username,
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

    useEffect(() => {
        const jwt = localStorage.getItem('jwt');
        if (jwt !== "undefined" && jwt != null) {
            navigate('/');
        } else {
            localStorage.clear();
        }
    });

    function Register() {
      function handleRegister() {
        navigate('/register')
      }

      return (
        <Button type="primary" htmlType="button" onClick={handleRegister} block>Register</Button>
      );
    }
    
    return (

        <div className="background">
          <div className="logowrapper">
            <div className="logocontainer">
              <img src={logo} />
            </div>
            <Form className="loginform" onFinish={submit}>
              {errorMessage !== "" && (
                <div className="erroralert">
                  <Alert message={errorMessage} onClose={dismissAlert} type="error" closable={true} />
                </div>
              )}
              <div className="login">
                <Typography.Title>Welcome back!</Typography.Title>
                <Form.Item
                  name={"username"}
                  rules={[
                    {
                      required: true,
                      type: "email",
                      message: "Please enter valid email",
                    }
                  ]}
                >
                  <Input placeholder="Enter your email" />
                </Form.Item>
                <Form.Item
                  name={"password"}
                  rules={[
                    {
                      required: true,
                      message: "Please enter your password",
                    }
                  ]}
                >
                  <Input.Password placeholder="Enter your password" />
                </Form.Item>
                <Button type="primary" htmlType="submit" block>Login</Button>
                <Divider style={{ borderColor: "black" }}>Forgot your password?</Divider>
                <Register />
              </div>
            </Form>
          </div>
        </div>
      );
}

export default LoginPage;
