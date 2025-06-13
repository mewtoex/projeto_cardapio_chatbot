import { type AddonCategory } from './Addon'; 

export interface MenuItem {
    id: number;
    name: string;
    category_id: string;
    category_name: string; 
    price: number;
    description: string;
    available: boolean;
    image_url?: string;
    has_addons: boolean;
    addon_categories?: AddonCategory[]; 
}

export interface MenuItemFormData {
    name: string;
    category_id: string;
    price: string; 
    description: string;
    available: boolean;
    image_url: string; 
    has_addons: boolean;
    addon_category_ids: string[];
}