// src/modules/admin/auth/components/AdminLoginForm.tsx
import React, { useState } from "react";
import AuthService from "../../../shared/services/AuthService";
import { useAuth } from "../../../auth/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminLoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await AuthService.adminLogin(email, password);
      login(response.user, response.token);
      // TODO: Redirect to admin dashboard
      navigate("/admin/dashboard"); // Example redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro no login.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div>
        <label htmlFor="admin-email">Email:</label>
        <input
          type="email"
          id="admin-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="admin-password">Senha:</label>
        <input
          type="password"
          id="admin-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
};

export default AdminLoginForm;

