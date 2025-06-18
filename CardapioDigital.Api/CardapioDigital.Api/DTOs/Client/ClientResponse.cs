using System;
using System.Collections.Generic;
using CardapioDigital.Api.DTOs.Address;
using CardapioDigital.Api.DTOs.User;
namespace CardapioDigital.Api.DTOs.Client
{
    public class ClientResponse
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Telephone { get; set; }

        public string CPF { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }


        public ICollection<AddressResponse> Addresses { get; set; }
    }
}