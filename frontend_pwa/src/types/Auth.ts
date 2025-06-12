export interface AuthUser {
    name: string;
    email: string;
    role: 'client' | 'admin';
}

export interface AuthResponse {
    user: AuthUser;
    access_token: string;
}