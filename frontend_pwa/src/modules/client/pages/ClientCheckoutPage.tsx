// src/modules/client/pages/ClientCheckoutPage.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import ApiService from "../../shared/services/ApiService";
import { useNotification } from '../../../contexts/NotificationContext';




interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  cep: string;
  isPrimary?: boolean;
}

const ClientCheckoutPage: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const notification = useNotification();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [cashAmount, setCashAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<[] | null>([]);
  const [loading, setLoading] = useState(false);

  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  let dummySubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let deliveryFee = 5.0;
  let dummyTotal = dummySubtotal + deliveryFee;
  
  useEffect(() => {
    const primaryAddress = userAddresses.find(addr => addr.isPrimary);
    if (primaryAddress) {
      setSelectedAddress(primaryAddress.id);
    }
  }, [userAddresses]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const primaryAddress = userAddresses.find(addr => addr.isPrimary);
        if (primaryAddress) {
          setSelectedAddress(primaryAddress.id);
        }
        const addressesData = await ApiService.getUserAddress();
        setUserAddresses(addressesData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao buscar endereços.');
        notification.showError('Erro ao carregar o cardápio');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Erro ao recuperar carrinho:', e);
      }
    }
    dummySubtotal = JSON.parse(savedCart).reduce((sum, item) => sum + item.price * item.quantity, 0);
    deliveryFee = 5.0;
    dummyTotal = dummySubtotal + deliveryFee;
  }, [notification]);





  const handleConfirmOrder = async () => {
    if (!selectedAddress) {
      setError("Por favor, selecione um endereço de entrega.");
      return;
    }
    if (!paymentMethod) {
      setError("Por favor, selecione uma forma de pagamento.");
      return;
    }
    if (paymentMethod === "cash" && !cashAmount && dummyTotal > 0) {
      const parsedCashAmount = parseFloat(cashAmount);
      if (isNaN(parsedCashAmount) || parsedCashAmount < dummyTotal) {
        setError("Para pagamento em dinheiro, informe um valor igual ou superior ao total do pedido para o troco.");
        return;
      }
    }

    setError(null);
    setLoading(true);

    const orderData = {
      userId: user?.email,
      items: dummyCartItems,
      totalAmount: dummyTotal,
      addressId: selectedAddress,
      paymentMethod: paymentMethod,
      cashProvided: paymentMethod === "cash" ? parseFloat(cashAmount) : undefined,
    };

    try {
      const response = await ApiService.createOrder(orderData);
      alert(`Pedido #${response.orderId} confirmado com sucesso!`);
      navigate("/client/orders");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao confirmar o pedido.");
    }
    setLoading(false);
  };

  return (
    <div>
      <h1>Finalizar Pedido</h1>
      {user && <p>Quase lá, {user.name}!</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        <h2>Endereço de Entrega</h2>
        {userAddresses.length > 0 ? (
          userAddresses.map(addr => (
            <div key={addr.id} style={{ border: selectedAddress === addr.id ? "2px solid blue" : "1px solid #ccc", padding: "10px", margin: "5px", cursor: "pointer" }} onClick={() => setSelectedAddress(addr.id)}>
              <p>{addr.street}, {addr.number} - {addr.district}</p>
              <p>{addr.city} - {addr.state}, CEP: {addr.cep}</p>
              {addr.isPrimary && <strong>(Principal)</strong>}
            </div>
          ))
        ) : (
          <p>Nenhum endereço cadastrado. <Link to="/client/profile/addresses">Adicionar Endereço</Link></p>
        )}
      </div>

      <div>
        <h2>Forma de Pagamento</h2>
        <div>
          <label>
            <input type="radio" name="paymentMethod" value="card" onChange={(e) => setPaymentMethod(e.target.value)} checked={paymentMethod === "card"} /> Cartão de Crédito/Débito (Simulado)
          </label>
        </div>
        <div>
          <label>
            <input type="radio" name="paymentMethod" value="pix" onChange={(e) => setPaymentMethod(e.target.value)} checked={paymentMethod === "pix"} /> PIX (Simulado)
          </label>
        </div>
        <div>
          <label>
            <input type="radio" name="paymentMethod" value="cash" onChange={(e) => setPaymentMethod(e.target.value)} checked={paymentMethod === "cash"} /> Dinheiro
          </label>
          {paymentMethod === "cash" && (
            <div style={{ marginLeft: "20px" }}>
              <label htmlFor="cashAmount">Troco para: R$</label>
              <input type="number" id="cashAmount" value={cashAmount} onChange={(e) => setCashAmount(e.target.value)} placeholder="Ex: 50.00" min={dummyTotal.toString()} />
            </div>
          )}
        </div>
      </div>

      <div>
        <h2>Resumo do Pedido</h2>
        {dummyCartItems.map(item => (
          <p key={item.id}>{item.name} (x{item.quantity}) - R$ {(item.price * item.quantity).toFixed(2)}</p>
        ))}
        <p>Subtotal: R$ {dummySubtotal.toFixed(2)}</p>
        <p>Taxa de Entrega: R$ {deliveryFee.toFixed(2)}</p>
        <p><strong>Total a Pagar: R$ {dummyTotal.toFixed(2)}</strong></p>
      </div>

      <button onClick={handleConfirmOrder} disabled={loading || !selectedAddress || !paymentMethod}>
        {loading ? "Confirmando..." : "Confirmar Pedido"}
      </button>
      <br />
      <Link to="/client/cart">Voltar ao Carrinho</Link>
    </div>
  );
};

export default ClientCheckoutPage;

