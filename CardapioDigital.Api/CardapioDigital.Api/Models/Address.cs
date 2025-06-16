using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CardapioDigital.Api.Models
{
    public class Address
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; } 

        [Required]
        [StringLength(200)]
        public string Street { get; set; }

        [Required]
        [StringLength(20)]
        public string Number { get; set; }

        [StringLength(100)]
        public string? Complement { get; set; } 
        [Required]
        [StringLength(100)]
        public string Neighborhood { get; set; }

        [Required]
        [StringLength(100)]
        public string City { get; set; }

        [Required]
        [StringLength(2)] 
        public string State { get; set; }

        [Required]
        [StringLength(10)] 
        public string ZipCode { get; set; }

        public bool IsDefault { get; set; } = false; 
        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public User User { get; set; } = null!; 

        public Address()
        {
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}