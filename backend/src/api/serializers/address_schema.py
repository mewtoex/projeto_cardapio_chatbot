# backend/src/api/serializers/address_schema.py
from marshmallow import Schema, fields, validate

class AddressSchema(Schema):
    id = fields.Integer(dump_only=True)
    user_id = fields.Integer(dump_only=True) # ID do usuário, apenas para saída
    street = fields.String(required=True, validate=validate.Length(min=1, max=255))
    number = fields.String(required=True, validate=validate.Length(min=1, max=50))
    complement = fields.String(allow_none=True, validate=validate.Length(max=100))
    district = fields.String(required=True, validate=validate.Length(min=1, max=100))
    city = fields.String(required=True, validate=validate.Length(min=1, max=100))
    state = fields.String(required=True, validate=validate.Length(min=2, max=50)) # Ex: "MG"
    cep = fields.String(required=True, validate=validate.Length(min=8, max=10)) # Ex: "12345-678"
    is_primary = fields.Boolean(missing=False) # Default para False na entrada

# Instâncias para uso
address_schema = AddressSchema()
addresses_schema = AddressSchema(many=True)