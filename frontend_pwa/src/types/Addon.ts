export interface AddonOption {
    id: string;
    addon_category_id: string;
    name: string;
    price: number;
}

export interface AddonCategory {
    id: string; 
    name: string;
    min_selections: number;
    max_selections: number;
    is_required: boolean;
    options: AddonOption[];
}

export interface AddonCategoryFormData {
    name: string;
    min_selections: number;
    max_selections: number;
    is_required: boolean;
}

export interface AddonOptionFormData {
    name: string;
    price: string; 
}