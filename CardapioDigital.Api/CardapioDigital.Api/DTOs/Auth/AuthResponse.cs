﻿namespace CardapioDigital.Api.DTOs.Auth
{
    public class AuthResponse
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string Email { get; set; } 
        public Boolean IsAdmin { get; set; }
        public string Token { get; set; }
    }
}