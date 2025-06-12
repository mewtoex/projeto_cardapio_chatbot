export interface Category {
    id: string;
    name: string;
    description?: string;
}

export interface CategoryFormData {
  name: string;
  description: string;
}