import React from 'react';
import Layout from '../components/Layout';
import ComingSoon from '../components/ComingSoon';

const Finance: React.FC = () => (
  <Layout>
    <ComingSoon 
      title="Finance Dashboard Coming Soon" 
      message="We're building a comprehensive finance dashboard to help you track payments, revenue, and financial metrics."
      icon="alert"
    />
  </Layout>
);

export default Finance;