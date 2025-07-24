import React from 'react';
import Layout from '../components/Layout';
import ComingSoon from '../components/ComingSoon';

const Chat: React.FC = () => (
  <Layout>
    <ComingSoon 
      title="Chat Feature Coming Soon" 
      message="Our team is working on an integrated chat system to help you communicate with riders and supervisors efficiently."
    />
  </Layout>
);

export default Chat;