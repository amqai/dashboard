import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import HomePage from "../Pages/Home/HomePage";
import InviteUsers from "../Pages/Admin/InviteUsers";
import LoginPage from '../Pages/LoginPage'; // Update with your actual LoginPage path
import RegisterPage from "../Pages/RegisterPage";
import AppHeader from "../Layout/AppHeader";
import SideMenu from "../Layout/SideMenu";
import { Layout } from "antd";
import { useEffect } from "react";
import Settings from "../Pages/Project/Settings";
import Chat from "../Pages/Project/Chat";
import { OrganizationProvider } from "./OrganizationProvider";
import Dashboard from "../Pages/Organization/Dashboard";
import ProjectDashboard from "../Pages/Project/Dashboard";
import Data from "../Pages/Project/Data";

function AppRoutes() {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if jwt token is not set in localStorage
        const jwt = localStorage.getItem('jwt')
        if (jwt === "undefined" || jwt === null) {
            // If not set, redirect to /login
            navigate('/login');
        }
    }, []);
    return (
        <Routes>
            <Route path="/register" element={<RegisterPage /> } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={
                <OrganizationProvider>
                    <Layout className="container">
                        <AppHeader />
                        <Layout>
                            <SideMenu />
                            <Layout.Content>
                                <Routes>
                                    <Route path="/" element={<HomePage />} />
                                    <Route path="/invite" element={<InviteUsers />} />
                                    <Route path="/organization/:organizationId/*" element={
                                        <Routes>
                                            <Route path="dashboard" element={<Dashboard /> } />
                                            <Route path="settings" element={<Settings /> } />
                                            <Route path="topics" element={<ProjectDashboard /> } />
                                            <Route path="topics/:topicId/*" element={
                                                <Routes>
                                                    <Route path="data" element={<Data /> } />
                                                </Routes>
                                            } />
                                            <Route path="chat" element={<Chat />} />
                                            <Route path="chat/:conversationId" element={<Chat />} />
                                            {/* Add your other project related routes here */}
                                        </Routes>
                                    } />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </Layout.Content>
                        </Layout>
                    </Layout>
                </OrganizationProvider>
                }
            />

        </Routes>
    );
}

export default AppRoutes;
