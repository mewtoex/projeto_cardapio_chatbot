# backend/src/api/serializers/menu_item_schema.py
from marshmallow import Schema, fields, validate
from .category_schema import CategorySchema # Importe CategorySchema se quiser aninhar
from .addon_schema import AddonCategorySchema, AddonOptionSchema # Importe schemas de addon

class MenuItemSchema(Schema):
    id = fields.Integer(dump_only=True)
    name = fields.String(required=True, validate=validate.Length(min=1, max=100))
    description = fields.String(validate=validate.Length(max=300), allow_none=True)
    price = fields.Float(required=True, validate=validate.Range(min=0.01))
    image_url = fields.String(allow_none=True) # URL da imagem, não o arquivo em si
    category_id = fields.Integer(required=True)
    available = fields.Boolean(missing=True) # Default para True na entrada se não fornecido
    has_addons = fields.Boolean(missing=False) # Default para False
    addon_category_ids = fields.List(fields.Integer(), data_key="addon_category_ids[]") # Espera lista de ints

class MenuItemDetailSchema(MenuItemSchema):
    # Inclui a categoria aninhada e as categorias de adicionais completas na saída
    category = fields.Nested(CategorySchema, dump_only=True)
    addon_categories = fields.List(fields.Nested(AddonCategorySchema), dump_only=True)

# Instâncias para uso
menu_item_schema = MenuItemSchema()
menu_item_detail_schema = MenuItemDetailSchema()
# menu_items_schema (para listas) já pode ser MenuItemSchema(many=True)