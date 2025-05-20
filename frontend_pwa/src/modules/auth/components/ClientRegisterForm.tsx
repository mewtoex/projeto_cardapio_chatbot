// src/modules/auth/components/ClientRegisterForm.tsx
import React, { useState } from 'react';
import AuthService from '../../shared/services/AuthService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ClientRegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [addressCep, setAddressCep] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [addressDistrict, setAddressDistrict] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // Assuming registration also logs the user in or you have a separate flow
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não conferem!");
      return;
    }
    if (!termsAccepted) {
      setError("Você precisa aceitar os Termos de Uso e Política de Privacidade.");
      return;
    }
    setLoading(true);
    try {
      const userData = {
        name,
        phone,
        email,
        password, // The backend should handle hashing
        address: {
          cep: addressCep,
          street: addressStreet,
          number: addressNumber,
          complement: addressComplement,
          district: addressDistrict,
          city: addressCity,
          state: addressState,
        }
      };
      const response = await AuthService.clientRegister(userData);
      // Assuming successful registration also logs the user in or returns necessary data to do so
      // For now, let's assume it returns a token and user object like login
      // You might need to adjust this based on your AuthService.clientRegister response
      // For example, if it doesn't auto-login, you might redirect to login page with a success message.
      alert(response.message); // Or handle success more gracefully
      // Optionally, log the user in directly if the API supports it and returns a token
      // const loginResponse = await AuthService.clientLogin(email, password); 
      // login(loginResponse.user, loginResponse.token);
      navigate('/login'); // Redirect to login after successful registration
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro no registro.');
    }
    setLoading(false);
  };

  // TODO: Implement CEP auto-fill logic using a Brazilian CEP API

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label htmlFor="name">Nome Completo:</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
      </div>
      <div>
        <label htmlFor="phone">Telefone:</label>
        <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={loading} />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
      </div>
      <div>
        <label htmlFor="password">Senha:</label>
        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
      </div>
      <div>
        <label htmlFor="confirmPassword">Confirmar Senha:</label>
        <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} />
      </div>
      
      <h3>Endereço Principal</h3>
      <div>
        <label htmlFor="addressCep">CEP:</label>
        <input type="text" id="addressCep" value={addressCep} onChange={(e) => setAddressCep(e.target.value)} required disabled={loading} />
      </div>
      <div>
        <label htmlFor="addressStreet">Rua/Avenida:</label>
        <input type="text" id="addressStreet" value={addressStreet} onChange={(e) => setAddressStreet(e.target.value)} required disabled={loading} />
      </div>
      <div>
        <label htmlFor="addressNumber">Número:</label>
        <input type="text" id="addressNumber" value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} required disabled={loading} />
      </div>
      <div>
        <label htmlFor="addressComplement">Complemento:</label>
        <input type="text" id="addressComplement" value={addressComplement} onChange={(e) => setAddressComplement(e.target.value)} disabled={loading} />
      </div>
      <div>
        <label htmlFor="addressDistrict">Bairro:</label>
        <input type="text" id="addressDistrict" value={addressDistrict} onChange={(e) => setAddressDistrict(e.target.value)} required disabled={loading} />
      </div>
      <div>
        <label htmlFor="addressCity">Cidade:</label>
        <input type="text" id="addressCity" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} required disabled={loading} />
      </div>
      <div>
        <label htmlFor="addressState">Estado:</label>
        <input type="text" id="addressState" value={addressState} onChange={(e) => setAddressState(e.target.value)} required disabled={loading} />
      </div>

      <div>
        <input type="checkbox" id="termsAccepted" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} disabled={loading} />
        <label htmlFor="termsAccepted">Li e aceito os Termos de Uso e Política de Privacidade.</label>
        {/* TODO: Add links to terms and policy */}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Registrando...' : 'Criar Conta'}
      </button>
    </form>
  );
};

export default ClientRegisterForm;

