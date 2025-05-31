# backend/src/api/serializers/store_schema.py
from marshmallow import Schema, fields, validate
from .address_schema import AddressSchema # Para aninhar o endereço

class StoreSchema(Schema):
    id = fields.Integer(dump_only=True)
    name = fields.String(required=True, validate=validate.Length(min=1, max=150))
    phone = fields.String(required=True, validate=validate.Length(min=8, max=20))
    email = fields.Email(required=True)
    address_id = fields.Integer(dump_only=True) # Apenas para saída
    address = fields.Nested(AddressSchema, required=True) # Aninha o schema de endereço
    admin_user_id = fields.Integer(dump_only=True) # Apenas para saída
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

# Instância para uso
store_schema = StoreSchema()