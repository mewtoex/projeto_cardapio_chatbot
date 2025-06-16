using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CardapioDigital.Api.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required] 
        [StringLength(80)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [StringLength(120)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(128)]
        public string PasswordHash { get; set; } = string.Empty;

        public bool IsAdmin { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        public ICollection<Address> Addresses { get; set; } = new List<Address>();

        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}