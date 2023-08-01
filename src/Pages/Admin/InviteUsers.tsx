import { useEffect, useState } from "react";
import { Table, Card, Button, Modal, Input, Checkbox, Alert} from "antd";
import { Alert as AlertModel, AlertType } from "../../models/Alert";
import "../../styles/common.css";

interface User {
    key: string,
    email: string,
    admin: string
}

function InviteUsers() {
    const [allowedUsers, setAllowedUsers] = useState<User[]>()
    const [isUserModal, setIsUserModal] = useState(false)
    const [addUser, setAddUser] = useState({
      email: '',
      admin: false
    })
    const [alertMessage, setAlertMessage] = useState<AlertModel | null>(null);

  useEffect(() => {
    (
      async () => {
          const jwt = localStorage.getItem('jwt');
          const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/allowed-user`, {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            }
          });

          const content = await response.json();
          const users = content?.allowedUsers.map((user: { email: string; admin: boolean }) => (
            {
              key: user.email,
              email: user.email,
              admin: user.admin.toString()
            }
          ))
          if(users != null) {
            setAllowedUsers(...[users])
          }
      }
      )();
  }, []);

  const handleAddUser = async () => {
    const jwt = localStorage.getItem('jwt');
    const email = addUser?.email
    const admin = addUser?.admin
    const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/allowed-user`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify({
        email,
        admin
      })
    });
    
    
    if (response.ok) {
      setAlertMessage({
        message: 'Allowed user successfully added',
        type: AlertType.Success,
      })
    } else {
      setAlertMessage({
        message: 'There was an error adding allowed user',
        type: AlertType.Error,
      })
    }

    const content = await response.json();
    if(content) {
        const user =[{
            key: content?.allowedUser.email,
            email: content?.allowedUser.email,
            admin: content?.allowedUser.admin.toString()
        }]
        setAllowedUsers(allowedUsers ? [...allowedUsers, ...user] : [...user])
    }
    setAddUser((addUser) => ({ ...addUser, email: '', admin: false}))
  }

  const handleDeleteUser = async (email: string) => {
    {

        if(allowedUsers?.length == 1){
          setAlertMessage({
            message: 'There must be at least one allowed user',
            type: AlertType.Error,
          })
        } else {
          const jwt = localStorage.getItem('jwt');
          await fetch(`${import.meta.env.VITE_APP_API_URL}/api/allowed-user?username=${email}`, {
            method: "DELETE",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            },
          })
          .then((response) => {
            if(response.ok) {
              setAllowedUsers(allowedUsers?.filter((user) => user.email != email))
            }
          })
        }
    }
  }

  const allowedUserColumns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Admin',
      dataIndex: 'admin',
      key: 'admin',
    },
    {
      title: 'Action',
      key: 'id',
      render: (_: any, record: { email: any; }) => (
        <Button onClick={() => handleDeleteUser(record.email)}>Delete</Button>
      ),
    },
  ];

  const dismissAlert = () => {
    setAlertMessage(null);
  };

    return (
        <div>
            <Card title={"Allowed Users"} bodyStyle={{padding: "0"}} style={{margin: "5%"}}>
                {alertMessage !== null && alertMessage.message !== "" && (
                  <div style={{margin: "24px"}}>
                    <Alert message={alertMessage.message} onClose={dismissAlert} type={alertMessage.type} closable={true} />
                  </div>
                )}
                <Button type="primary" onClick={() => setIsUserModal(true)} style={{marginTop: "24px", marginLeft: "24px"}}> + Add User</Button>
                <div className="settings-form-buttons" style={{borderTop: 0}}>
                </div>
                <div className="settings-form-field-100">
                <Table style={{paddingLeft: "24px", paddingTop: "24px"}} dataSource={allowedUsers} columns={allowedUserColumns} />
                </div>
            </Card>

            <Modal
                open={isUserModal}
                title="Add Allowed User"
                okText="Save"
                onCancel={() => {
                    setIsUserModal(false)
                }}
                onOk={() => {
                    handleAddUser()
                    setIsUserModal(false)
                }}
            >
                <Input placeholder="Enter user email" value={addUser?.email} onChange={(e) => setAddUser((addUser) => ({ ...addUser, email: e.target.value}))}/>
                <Checkbox style={{marginTop: "10px"}} checked={addUser?.admin} onChange={(e) => setAddUser((addUser) => ({ ...addUser, admin: e.target.checked}))}>Check for admin privileges</Checkbox>
            </Modal>

      </div>
    );
}

export default InviteUsers;