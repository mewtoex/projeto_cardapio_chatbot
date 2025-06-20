﻿using System;
using System.Collections.Generic;
using CardapioDigital.Api.DTOs.Address;
using CardapioDigital.Api.DTOs.Client; 

namespace CardapioDigital.Api.DTOs.User
{
    public class UserProfileResponse
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public ClientResponse Client { get; set; }
    }
}