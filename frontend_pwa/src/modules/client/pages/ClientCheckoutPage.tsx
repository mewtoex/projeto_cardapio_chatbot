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

interface AddonOption {
  id: string;
  name: string;
  price: number;
}

interface CartItemDetails {
  id: number;
  name: string;
  quantity: number;
  price: number;
  observations?: string;
  selectedAddons?: AddonOption[];
  totalItemPrice: number;
}

const ClientCheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const notification = useNotification();
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [cashAmount, setCashAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItemDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCart, setLoadingCart] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const subtotal = cartItems.reduce((sum, item) => sum + item.totalItemPrice * item.quantity, 0);
  const deliveryFee = 5.0;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    const loadCheckoutData = async () => {
      setLoadingAddresses(true);
      setLoadingCart(true);
      setError(null);
      try {
        const profileData = await ApiService.getUserAddress();
        if (profileData) {
          setUserAddresses(profileData);
          const primaryAddress = profileData.find((addr: Address) => addr.isPrimary);
          if (primaryAddress) {
            setSelectedAddressId(primaryAddress.id);
          } else if (profileData.length > 0) {
            setSelectedAddressId(profileData[0].id);
          }
        } else {
          setUserAddresses([]);
          notification.showWarning("Nenhum endereço cadastrado. Por favor, adicione um endereço no seu perfil.");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError("Falha ao buscar endereços: " + errorMessage);
        notification.showError("Falha ao buscar endereços.");
        console.error("Erro ao buscar endereços:", err);
      } finally {
        setLoadingAddresses(false);
      }

      try {
        const savedCart = localStorage.getItem("cartItems");
        const parsedCart = savedCart ? JSON.parse(savedCart) : {};

        const detailedCartItems: CartItemDetails[] = Object.values(parsedCart);

        if (detailedCartItems.length === 0) {
            notification.showWarning("Seu carrinho está vazio. Adicione itens antes de finalizar o pedido.");
            navigate("/client/menu");
            return;
        }
        setCartItems(detailedCartItems);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError("Falha ao carregar itens do carrinho: " + errorMessage);
        notification.showError("Falha ao carregar itens do carrinho.");
        setCartItems([]);
        localStorage.removeItem('cartItems');
      } finally {
        setLoadingCart(false);
      }
    };

    loadCheckoutData();
  }, [notification, navigate]);

  const handleConfirmOrder = async () => {
    if (!selectedAddressId) {
      setError("Por favor, selecione um endereço de entrega.");
      notification.showError("Por favor, selecione um endereço de entrega.");
      return;
    }
    if (!paymentMethod) {
      setError("Por favor, selecione uma forma de pagamento.");
      notification.showError("Por favor, selecione uma forma de pagamento.");
      return;
    }
    if (cartItems.length === 0) {
      setError("Seu carrinho está vazio. Por favor, adicione itens ao carrinho.");
      notification.showError("Seu carrinho está vazio. Adicione itens antes de finalizar.");
      navigate("/client/menu");
      return;
    }

    let cashProvidedAmount: number | undefined = undefined;
    if (paymentMethod === "DINHEIRO") {
      const parsedCashAmount = parseFloat(cashAmount);
      if (isNaN(parsedCashAmount) || parsedCashAmount < total) {
        setError("Para pagamento em dinheiro, informe um valor igual ou superior ao total do pedido para o troco.");
        notification.showError("Valor em dinheiro insuficiente para o troco.");
        return;
      }
      cashProvidedAmount = parsedCashAmount;
    }

    setError(null);
    setLoading(true);

    const orderData = {
      address_id: parseInt(selectedAddressId),
      payment_method: paymentMethod,
      items: cartItems.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        price_at_order_time: item.totalItemPrice,
        observations: item.observations,
        selected_addons: item.selectedAddons?.map(addon => ({
            id: parseInt(addon.id),
            name: addon.name,
            price: addon.price
        })) || [],
      })),
      cash_provided: cashProvidedAmount,
      total_amount: total
    };
    
    console.log("Dados do pedido a serem enviados:", orderData);

    try {
      const response = await ApiService.createOrder(orderData);
      notification.showSuccess(`Pedido #${response.id} confirmado com sucesso!`);
      localStorage.removeItem("cartItems");
      setCartItems([]);
      navigate(`/client/orders`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Erro ao confirmar pedido:", err);
      setError("Falha ao confirmar o pedido: " + errorMessage);
      notification.showError("Falha ao confirmar o pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Finalizar Pedido</h1>
      {user && <p>Quase lá, {user.name}!</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        <h2>Endereço de Entrega</h2>
        {loadingAddresses ? (
          <p>Carregando endereços...</p>
        ) : userAddresses.length > 0 ? (
          userAddresses.map(addr => (
            <div
              key={addr.id}
              style={{
                border: selectedAddressId === addr.id ? "2px solid blue" : "1px solid #ccc",
                padding: "10px",
                margin: "5px",
                cursor: "pointer"
              }}
              onClick={() => setSelectedAddressId(addr.id)}
            >
              <p>{addr.street}, {addr.number}{addr.complement ? ` - ${addr.complement}` : ""} - {addr.district}</p>
              <p>{addr.city} - {addr.state}, CEP: {addr.cep}</p>
              {addr.isPrimary && <strong>(Principal)</strong>}
            </div>
          ))
        ) : (
          <p>Nenhum endereço cadastrado. <Link to="/client/profile">Adicionar Endereço no Perfil</Link></p>
        )}
      </div>

      <div>
        <h2>Forma de Pagamento</h2>
        <div>
          <label>
            <input type="radio" name="paymentMethod" value="CARTAO_CREDITO" onChange={(e) => setPaymentMethod(e.target.value)} checked={paymentMethod === "CARTAO_CREDITO"} /> Cartão de Crédito
          </label>
        </div>
        <div>
          <label>
            <input type="radio" name="paymentMethod" value="CARTAO_DEBITO" onChange={(e) => setPaymentMethod(e.target.value)} checked={paymentMethod === "CARTAO_DEBITO"} /> Cartão de Débito
          </label>
        </div>
        <div>
          <label>
            <input type="radio" name="paymentMethod" value="PIX" onChange={(e) => setPaymentMethod(e.target.value)} checked={paymentMethod === "PIX"} /> PIX
          </label>
        </div>
        <div>
          <label>
            <input type="radio" name="paymentMethod" value="DINHEIRO" onChange={(e) => setPaymentMethod(e.target.value)} checked={paymentMethod === "DINHEIRO"} /> Dinheiro
          </label>
          {paymentMethod === "DINHEIRO" && (
            <div style={{ marginLeft: "20px" }}>
              <label htmlFor="cashAmount">Troco para: R$</label>
              <input
                type="number"
                id="cashAmount"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder={`Ex: ${total.toFixed(2)} ou mais`}
                min={total.toString()}
                step="0.01"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <h2>Resumo do Pedido</h2>
        {loadingCart ? (
          <p>Carregando itens do carrinho...</p>
        ) : cartItems.length > 0 ? (
          cartItems.map(item => (
            <p key={`${item.id}-${item.observations}-${JSON.stringify(item.selectedAddons)}`}>
              {item.name} (x{item.quantity}) - R$ {(item.totalItemPrice * item.quantity).toFixed(2)}
              {item.selectedAddons && item.selectedAddons.length > 0 && (
                ` (+ Adicionais: ${item.selectedAddons.map(addon => addon.name).join(', ')})`
              )}
              {item.observations && ` (Obs: ${item.observations})`}
            </p>
          ))
        ) : (
          <p>Seu carrinho está vazio.</p>
        )}
        <p>Subtotal: R$ {subtotal.toFixed(2)}</p>
        <p>Taxa de Entrega: R$ {deliveryFee.toFixed(2)}</p>
        <p><strong>Total a Pagar: R$ {total.toFixed(2)}</strong></p>
      </div>

      <button onClick={handleConfirmOrder} disabled={loading || loadingAddresses || loadingCart || !selectedAddressId || !paymentMethod || cartItems.length === 0}>
        {loading ? "Confirmando..." : "Confirmar Pedido"}
      </button>
      <br />
      <Link to="/client/cart">Voltar ao Carrinho</Link>
    </div>
  );
};

export default ClientCheckoutPage;