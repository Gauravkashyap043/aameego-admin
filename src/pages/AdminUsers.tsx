import React from 'react';
import Layout from '../components/Layout';
import UserManagement from './UserManagementPage';
// import ComingSoon from '../components/ComingSoon';

const AdminUsers: React.FC = () => (
  <Layout>
    <UserManagement/>
  </Layout>
);

export default AdminUsers;