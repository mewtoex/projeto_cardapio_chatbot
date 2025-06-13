// frontend_pwa/src/types/Store.ts
export interface Store {
    id?: string;
    name: string;
    phone: string;
    address_street: string;
    address_number: string;
    address_complement?: string;
    address_district: string;
    address_city: string;
    address_state: string;
    address_cep: string; // Adicionado para consistência
    logo_url?: string;
    is_open: boolean; // Adicionado para consistência
    created_at?: string;
    updated_at?: string;
}