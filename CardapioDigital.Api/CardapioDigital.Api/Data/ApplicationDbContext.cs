using Microsoft.EntityFrameworkCore;
using CardapioDigital.Api.Models; 

namespace CardapioDigital.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Address> Addresses { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<MenuItem> MenuItems { get; set; }
        public DbSet<AddonCategory> AddonCategories { get; set; }
        public DbSet<Addon> Addons { get; set; }
        public DbSet<BotMessage> BotMessages { get; set; }
        public DbSet<DeliveryArea> DeliveryAreas { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Promotion> Promotions { get; set; }
        public DbSet<Store> Stores { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Username).IsUnique(); 
                entity.HasIndex(u => u.Email).IsUnique();    
            });

            modelBuilder.Entity<Store>(entity =>
            {
                entity.HasIndex(s => s.Name).IsUnique();        
                entity.HasIndex(s => s.PhoneNumber).IsUnique();  
            });

            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasIndex(c => c.Name).IsUnique(); 
            });

            modelBuilder.Entity<MenuItem>(entity =>
            {
                entity.HasIndex(mi => mi.Name).IsUnique();
                entity.HasMany(mi => mi.AddonCategories)
                      .WithMany(ac => ac.MenuItems)
                      .UsingEntity(j => j.ToTable("MenuItemAddonCategories")); 
            });

            modelBuilder.Entity<AddonCategory>(entity =>
            {
                entity.HasIndex(ac => ac.Name).IsUnique(); 
            });

            modelBuilder.Entity<BotMessage>(entity =>
            {
                entity.HasIndex(bm => bm.MessageKey).IsUnique(); 
            });

            modelBuilder.Entity<OrderItem>()
                .HasMany(oi => oi.Addons)
                .WithMany(a => a.OrderItems)
                .UsingEntity(j => j.ToTable("OrderItemAddons")); 

        }
    }
}