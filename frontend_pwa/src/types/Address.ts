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