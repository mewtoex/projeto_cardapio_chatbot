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

  setUserData(userData: any): void { 
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
  }

  getUserData(): any | null { 
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  removeUserData(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  logout(): void {
    this.removeToken();
    this.removeUserData();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default new AuthService();