import React from 'react';
import Navbar from '../components/Navbar';
import { TabProvider } from '../contexts/TabContext';

const HomePage: React.FC = () => {
  return (
    <TabProvider>
        <div>
            <Navbar/>
        </div>
    </TabProvider>

  )
}

export default HomePage;