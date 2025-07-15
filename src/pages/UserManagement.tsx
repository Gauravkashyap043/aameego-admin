import React from 'react';
import Layout from '../components/Layout';
import Table from '../components/Table';

const UserManagement: React.FC = () => (
  <Layout>
    <div className="p-8">
      <Table />
    </div>
  </Layout>
);

export default UserManagement; 