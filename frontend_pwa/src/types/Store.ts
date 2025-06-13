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
    address_cep: string; 
    logo_url?: string;
    is_open: boolean; 
    created_at?: string;
    updated_at?: string;
    address?: string;
    opening_hours?: string; 
    avg_preparation_time_minutes?: number;
}