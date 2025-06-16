using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CardapioDigital.Api.Models
{
    public class Store
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Column(TypeName = "longtext")] 
        public string Description { get; set; }

        [Required]
        [StringLength(20)]
        public string PhoneNumber { get; set; } 

        [StringLength(255)]
        public string Address { get; set; } 

        [StringLength(50)]
        public string OperatingStatus { get; set; } = "closed";

        [Column(TypeName = "time")] 
        public TimeSpan? OpeningTime { get; set; } 

        [Column(TypeName = "time")]
        public TimeSpan? ClosingTime { get; set; } 

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public Store()
        {
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}