export interface Address {
    id?: string;
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    cep: string;
    is_primary?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Store {
    id?: string;
    name: string;
    phone: string;
    email: string;
    address_id?: string;
    address?: Address; // Nested address object
    admin_user_id?: string;
    created_at?: string;
    updated_at?: string;
}