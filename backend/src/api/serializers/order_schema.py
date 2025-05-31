# backend/src/api/serializers/order_schema.py
from marshmallow import Schema, fields, validate
from marshmallow.fields import Nested
from .user_schema import UserProfileSchema # Para aninhar dados do usuário
from .address_schema import AddressSchema # Para aninhar dados de endereço
from .menu_item_schema import MenuItemSchema # Para aninhar dados do item de menu
from .addon_schema import AddonOptionSchema # Para aninhar dados de adicionais

class OrderItemAddonSchema(Schema):
    id = fields.Integer(dump_only=True)
    addon_option_id = fields.Integer(allow_none=True)
    addon_name = fields.String(required=True)
    addon_price = fields.Float(required=True)

class OrderItemSchema(Schema):
    id = fields.Integer(dump_only=True)
    order_id = fields.Integer(dump_only=True)
    menu_item_id = fields.Integer(required=True)
    quantity = fields.Integer(required=True, validate=validate.Range(min=1))
    price_at_order_time = fields.Float(required=True, validate=validate.Range(min=0.0))
    observations = fields.String(allow_none=True, validate=validate.Length(max=500))
    
    # Detalhes do item de menu e adicionais para saída
    menu_item_name = fields.String(dump_only=True)
    menu_item_description = fields.String(dump_only=True)
    selected_addons = fields.List(Nested(OrderItemAddonSchema), dump_only=True) # Para saída

class OrderCreateItemSchema(Schema):
    # Schema para itens ao criar um pedido (input)
    menu_item_id = fields.Integer(required=True)
    quantity = fields.Integer(required=True, validate=validate.Range(min=1))
    observations = fields.String(allow_none=True, validate=validate.Length(max=500))
    # Para receber os adicionais, que podem ser um JSON simples ou mais complexo
    # Se você for validar cada addon individualmente, pode ser um Nested(AddonOptionSchema)
    # Por enquanto, mantendo como lista de dicionários para flexibilidade.
    selected_addons = fields.List(fields.Dict(), required=False)


class OrderSchema(Schema):
    id = fields.Integer(dump_only=True)
    user_id = fields.Integer(dump_only=True)
    address_id = fields.Integer(required=True) # Para input na criação
    order_date = fields.DateTime(dump_only=True)
    status = fields.String(dump_only=True) # Status é gerenciado pelo backend
    total_amount = fields.Float(dump_only=True) # Total é calculado no backend
    payment_method = fields.String(required=True, validate=validate.OneOf(["CARTAO_CREDITO", "CARTAO_DEBITO", "PIX", "DINHEIRO"]))
    cash_provided = fields.Float(allow_none=True) # Apenas se payment_method for DINHEIRO
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    # Aninhar relacionamentos para saída
    user_name = fields.String(dump_only=True)
    user_email = fields.String(dump_only=True)
    items = fields.List(Nested(OrderItemSchema), dump_only=True) # Itens detalhados para saída
    user = Nested(UserProfileSchema, exclude=('addresses', 'new_password', 'current_password'), dump_only=True) # Exclui dados sensíveis
    address = Nested(AddressSchema, dump_only=True)


class OrderShortSchema(Schema):
    # Schema simplificado para listagens de pedidos (ex: histórico do cliente)
    id = fields.Integer(dump_only=True)
    user_id = fields.Integer(dump_only=True)
    order_date = fields.DateTime(dump_only=True)
    status = fields.String(dump_only=True)
    total_amount = fields.Float(dump_only=True)
    user_name = fields.String(dump_only=True)

class OrderCreateSchema(Schema):
    # Schema para a criação de um pedido (input)
    address_id = fields.Integer(required=True)
    payment_method = fields.String(required=True, validate=validate.OneOf(["CARTAO_CREDITO", "CARTAO_DEBITO", "PIX", "DINHEIRO"]))
    cash_provided = fields.Float(allow_none=True)
    items = fields.List(Nested(OrderCreateItemSchema), required=True, validate=validate.Length(min=1))