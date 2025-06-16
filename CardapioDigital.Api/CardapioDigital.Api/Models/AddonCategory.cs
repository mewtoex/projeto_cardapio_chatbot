using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CardapioDigital.Api.Models
{
    public class AddonCategory
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        public int MinSelection { get; set; } = 0; 
        public int MaxSelection { get; set; } = 1; 
        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public ICollection<Addon> Addons { get; set; }

        public ICollection<MenuItem> MenuItems { get; set; }

        public AddonCategory()
        {
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
            Addons = new HashSet<Addon>();
            MenuItems = new HashSet<MenuItem>(); 
        }
    }
}