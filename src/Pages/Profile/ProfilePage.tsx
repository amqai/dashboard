import { Form, Button, Input, Alert, Typography } from "antd";
import { useState } from "react";

function ProfilePage() {
    const [errorMessage, setErrorMessage] = useState('');

    const resetPassword = async () => {
        console.log("here")
    }

    const dismissAlert = () => {
        setErrorMessage("");
    };

    return (
    
        <div className="center-wrapper"
        style={{
            margin: "5%"
        }}
        >
            <Typography.Title level={3}>Profile</Typography.Title>
            <h1>Password Reset</h1>
            <Form className="passwordResetForrm"
                onFinish={resetPassword}
            >
            <Form.Item
                name={"oldPassword"}
                rules={[
                    {
                    required: true,
                    message: "Please enter old password",
                    }
                ]}
            >                  
            <Input.Password 
                placeholder="Please enter your new password"
            />
            </Form.Item>

            <Form.Item
                name={"newPassword"}
                rules={[
                    {
                    required: true,
                    message: "Please enter new password",
                    }
                ]}
            >                  
            <Input.Password placeholder="Please enter your new password" />
            </Form.Item>

            <Button type="primary"
            htmlType="submit"
            block
            style={{width: "auto"}}
            >Update Password</Button>
            {errorMessage !== "" && (
                <div className="erroralert">
                <Alert message={errorMessage} onClose={dismissAlert} type="error" closable={true} />
                </div>
            )}
            </Form>
        </div>
        
        
    )

}

export default ProfilePage;