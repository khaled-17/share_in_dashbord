import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
  pageSubtitle?: string;
  headerActions?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  pageTitle,
  pageSubtitle,
  headerActions,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="mr-64 transition-all duration-300">
        <Header 
          title={pageTitle} 
          subtitle={pageSubtitle} 
          actions={headerActions}
        />
        
        <main className="p-6">
          {children}
        </main>
      </div>
      
    </div>
  );
};
