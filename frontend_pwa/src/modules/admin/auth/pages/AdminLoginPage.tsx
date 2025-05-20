// src/modules/admin/auth/pages/AdminLoginPage.tsx
import React from 'react';
import AdminLoginForm from '../components/AdminLoginForm';

const AdminLoginPage: React.FC = () => {
  return (
    <div>
      <h1>Login do Administrador</h1>
      <AdminLoginForm />
      {/* Admin area might not have a public registration link */}
    </div>
  );
};

export default AdminLoginPage;

