import { type Address } from './Address'; 

export interface Store {
    id?: string;
    name: string;
    phone: string;
    email: string;
    address_id?: string;
    address?: Address; 
    admin_user_id?: string;
    created_at?: string;
    updated_at?: string;
}