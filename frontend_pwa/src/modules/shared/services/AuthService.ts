// frontend_pwa/src/modules/shared/services/AuthService.ts
// Este serviço é focado apenas no gerenciamento do token JWT no cliente (localStorage)
// As chamadas de API de autenticação são responsabilidade de `api.ts`

class AuthService {
  private TOKEN_KEY = 'jwt_token';
  private USER_KEY = 'user_data';

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  setUserData(userData: any): void { // Considere tipar userData mais especificamente
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
  }

  getUserData(): any | null { // Considere tipar o retorno
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  removeUserData(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  logout(): void {
    this.removeToken();
    this.removeUserData();
    // Não força redirecionamento aqui, quem usar o AuthService para logout
    // deve fazer o redirecionamento. Isso permite mais flexibilidade.
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default new AuthService();