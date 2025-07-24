import React from 'react';
import Layout from '../components/Layout';
import ComingSoon from '../components/ComingSoon';

const LatestActivity: React.FC = () => (
  <Layout>
    <ComingSoon 
      title="Activity Feed Coming Soon" 
      message="We're developing a real-time activity feed to keep you updated on all important events and actions in the system."
    />
  </Layout>
);

export default LatestActivity;