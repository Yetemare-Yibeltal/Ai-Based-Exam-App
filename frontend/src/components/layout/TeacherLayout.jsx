import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const TeacherLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <Sidebar />
    <div className="lg:pl-64 pt-16">
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  </div>
);

export default TeacherLayout;