using AutoMapper;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.DTOs.Auth;
using CardapioDigital.Api.DTOs.User;
using CardapioDigital.Api.DTOs.Address;
using CardapioDigital.Api.DTOs.Addon;
using CardapioDigital.Api.DTOs.AddonCategory;
using CardapioDigital.Api.DTOs.BotMessage;
using CardapioDigital.Api.DTOs.Category;
using CardapioDigital.Api.DTOs.DeliveryArea;
using CardapioDigital.Api.DTOs.MenuItem;
using CardapioDigital.Api.DTOs.Order;
using CardapioDigital.Api.DTOs.OrderItem;
using CardapioDigital.Api.DTOs.Promotion;
using CardapioDigital.Api.DTOs.Store;
using CardapioDigital.Api.DTOs.Client;
using CardapioDigital.Api.DTOs.Auth.PasswordReset;

namespace CardapioDigital.Api.MappingProfiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<User, AuthResponse>();
            CreateMap<RegisterRequest, User>()
                .ForMember(dest => dest.Client, opt => opt.Ignore()); 
            CreateMap<CreateClientRequest, Client>();

            CreateMap<User, UserProfileResponse>()
                .ForMember(dest => dest.Client, opt => opt.MapFrom(src => src.Client)); 

            CreateMap<Client, ClientResponse>()
                .ForMember(dest => dest.Addresses, opt => opt.MapFrom(src => src.Addresses));
            CreateMap<CreateClientRequest, Client>(); 
            CreateMap<UpdateClientProfileRequest, Client>();

            CreateMap<Address, AddressResponse>();
            CreateMap<AddressRequest, Address>();


            CreateMap<AddonCategory, AddonCategoryResponse>();
            CreateMap<AddonCategoryRequest, AddonCategory>();

            CreateMap<Addon, AddonResponse>();
            CreateMap<AddonRequest, Addon>();

            CreateMap<BotMessage, BotMessageResponse>();
            CreateMap<BotMessageRequest, BotMessage>();

            CreateMap<Category, CategoryResponse>();
            CreateMap<CategoryRequest, Category>();

            CreateMap<DeliveryArea, DeliveryAreaResponse>();
            CreateMap<DeliveryAreaRequest, DeliveryArea>();

            CreateMap<MenuItem, MenuItemResponse>()
                .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category))
                .ForMember(dest => dest.AddonCategories, opt => opt.MapFrom(src => src.AddonCategories));
            CreateMap<MenuItemRequest, MenuItem>()
                 .ForMember(dest => dest.AddonCategories, opt => opt.Ignore());

            CreateMap<Order, OrderResponse>()
                .ForMember(dest => dest.Client, opt => opt.MapFrom(src => src.Client)) 
                .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Address))
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items));
            CreateMap<CreateOrderRequest, Order>()
                .ForMember(dest => dest.Items, opt => opt.Ignore())
                .ForMember(dest => dest.TotalAmount, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
            CreateMap<UpdateOrderStatusRequest, Order>();

            CreateMap<OrderItem, OrderItemResponse>()
                .ForMember(dest => dest.MenuItem, opt => opt.MapFrom(src => src.MenuItem))
                .ForMember(dest => dest.Addons, opt => opt.MapFrom(src => src.Addons));
            CreateMap<OrderItemRequest, OrderItem>()
                .ForMember(dest => dest.Price, opt => opt.Ignore())
                .ForMember(dest => dest.Addons, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            CreateMap<Promotion, PromotionResponse>();
            CreateMap<PromotionRequest, Promotion>()
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            CreateMap<Store, StoreResponse>()
                .ForMember(dest => dest.OpeningTime, opt => opt.MapFrom(src => src.OpeningTime.HasValue ? src.OpeningTime.Value.ToString(@"hh\:mm") : null))
                .ForMember(dest => dest.ClosingTime, opt => opt.MapFrom(src => src.ClosingTime.HasValue ? src.ClosingTime.Value.ToString(@"hh\:mm") : null));
            CreateMap<StoreRequest, Store>()
                .ForMember(dest => dest.OpeningTime, opt => opt.Ignore())
                .ForMember(dest => dest.ClosingTime, opt => opt.Ignore());
            CreateMap<UpdateStoreStatusRequest, Store>();
        }
    }
}