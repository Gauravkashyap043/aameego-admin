import React from 'react';
import Layout from '../components/Layout';
import ComingSoon from '../components/ComingSoon';

const AdminUsers: React.FC = () => (
  <Layout>
    <ComingSoon 
      title="Admin Management Coming Soon" 
      message="We're building a comprehensive admin management system to help you manage roles, permissions, and access control."
      icon="alert"
    />
  </Layout>
);

export default AdminUsers;