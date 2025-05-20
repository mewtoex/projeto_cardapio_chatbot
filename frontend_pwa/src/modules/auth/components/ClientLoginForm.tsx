// src/modules/auth/components/ClientLoginForm.tsx
import React, { useState } from 'react';
import AuthService from '../../shared/services/AuthService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // Assuming you'll redirect after login

const ClientLoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate(); // For redirection

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await AuthService.clientLogin(email, password);
      // Assuming response contains { token: string, user: AuthUser }
      login(response.user, response.token);
      // TODO: Redirect to client dashboard or home page
      navigate('/client/dashboard'); // Example redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro no login.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="password">Senha:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
      {/* TODO: Add link for password recovery */}
    </form>
  );
};

export default ClientLoginForm;

