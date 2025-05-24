// src/modules/client/pages/ClientCheckoutPage.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import ApiService from "../../shared/services/ApiService";

// Dummy cart data for now - in a real app, this would come from a cart context/state
const dummyCartItems = [
  { id: 1, name: "X-Burger Especial", quantity: 2, price: 25.0 },
  { id: 3, name: "Coca-Cola Lata", quantity: 4, price: 5.0 },
];
const dummySubtotal = dummyCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
const deliveryFee = 5.0;
const dummyTotal = dummySubtotal + deliveryFee;

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
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null); // Store address ID
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null); // e.g., "card", "pix", "cash"
  const [cashAmount, setCashAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [userAddresses, setUserAddresses] = useState<Address[]>([
    { id: "addr1", street: "Rua Principal", number: "123", district: "Centro", city: "Cidade Exemplo", state: "EX", cep: "12345-678", isPrimary: true },
    { id: "addr2", street: "Av. Secundária", number: "456", district: "Bairro Novo", city: "Cidade Exemplo", state: "EX", cep: "98765-432" },
  ]);

  useEffect(() => {
    const primaryAddress = userAddresses.find(addr => addr.isPrimary);
    if (primaryAddress) {
      setSelectedAddress(primaryAddress.id);
    }
  }, [userAddresses]);

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
        // Only require cashAmount if there is a total to pay and method is cash
        const parsedCashAmount = parseFloat(cashAmount);
        if (isNaN(parsedCashAmount) || parsedCashAmount < dummyTotal) {
            setError("Para pagamento em dinheiro, informe um valor igual ou superior ao total do pedido para o troco.");
            return;
        }
    }

    setError(null);
    setLoading(true);

    const orderData = {
      userId: user?.email, // Or user.id if available
      items: dummyCartItems, // This should come from actual cart state
      totalAmount: dummyTotal,
      addressId: selectedAddress,
      paymentMethod: paymentMethod,
      cashProvided: paymentMethod === "cash" ? parseFloat(cashAmount) : undefined,
      // Add other necessary order details
    };

    try {
      // In a real scenario, you would pass the auth token if required by the API
      const response = await ApiService.createOrder(orderData);
      alert(`Pedido #${response.orderId} confirmado com sucesso!`);
      // TODO: Clear cart, redirect to order confirmation/status page
      navigate("/client/orders"); // Or a specific order confirmation page
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
            <div key={addr.id} style={{border: selectedAddress === addr.id ? "2px solid blue" : "1px solid #ccc", padding: "10px", margin: "5px", cursor: "pointer"}} onClick={() => setSelectedAddress(addr.id)}>
              <p>{addr.street}, {addr.number} - {addr.district}</p>
              <p>{addr.city} - {addr.state}, CEP: {addr.cep}</p>
              {addr.isPrimary && <strong>(Principal)</strong>}
            </div>
          ))
        ) : (
          <p>Nenhum endereço cadastrado. <Link to="/client/profile/addresses">Adicionar Endereço</Link></p>
        )}
        {/* TODO: Add option to add new address here or link to profile */}
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
            <div style={{marginLeft: "20px"}}>
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

