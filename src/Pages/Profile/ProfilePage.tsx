import { Form, Button, Input, Alert, Typography, Card} from "antd";
import { useState } from "react";
import { AlertType, Alert as AlertModel } from "../../models/Alert";

function ProfilePage() {
    const [alertMessage, setAlertMessage] = useState<AlertModel | null>(null);

    const resetPassword = async (values: { currentPassword: any; newPassword: string }) => {
        const { currentPassword, newPassword } = values;
        const jwt = localStorage.getItem('jwt');
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/person:password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`,
            },
            body: JSON.stringify({
                currentPassword,
                newPassword,
            })
        });
        
        if (response.ok) {
            setAlertMessage({
                message: 'Your password was successfully updated',
                type: AlertType.Success,
            })
        } else {
            setAlertMessage({
                message: 'There was an issue updating your password',
                type: AlertType.Error,
            })
        }
    }

    const dismissAlert = () => {
        setAlertMessage(null);
    };

    return (
        <div className="center-wrapper">
            {alertMessage !== null && alertMessage.message !== "" && (
                <div style={{margin: "24px"}}>
                <Alert message={alertMessage.message} onClose={dismissAlert} type={alertMessage.type} closable={true} />
                </div>
            )}
            <Typography.Title level={3}>Profile</Typography.Title>
            <Card>
                <h1>Password Reset</h1>
                <Form className="passwordResetForrm"
                    onFinish={resetPassword}
                    labelCol={{span: 2}}
                >
                <Form.Item
                    name={"currentPassword"}
                    label="Current Password"
                    rules={[
                        {
                        required: true,
                        message: "Please enter current password",
                        }
                    ]}
                >                  
                    <Input.Password 
                        placeholder="Please enter your current password"
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    name={"newPassword"}
                    label="New Password"
                    rules={[
                        {
                        required: true,
                        message: "Please enter new password",
                        }
                    ]}
                >                  
                    <Input.Password 
                        placeholder="Please enter your new password"
                        size="large"
                    />
                </Form.Item>

                <Button type="primary"
                    htmlType="submit"
                    size="large"
                >Update Password</Button>
                </Form>
            </Card>
        </div>
        
        
    )

}

export default ProfilePage;