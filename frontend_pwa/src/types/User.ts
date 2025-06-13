import { type  Address } from './Address'; 

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'client' | 'admin';
    addresses?: Address[]; 
}

export interface UserRegisterData {
    name: string;
    phone: string;
    email: string;
    password: string;
    address: Address;
}

export interface UserLoginData {
    email: string;
    password: string;
}

export interface UserUpdateProfileData {
    name?: string;
    phone?: string;
    current_password?: string;
    new_password?: string;
}

