# backend/src/api/serializers/user_schema.py
from marshmallow import Schema, fields, validate
from .address_schema import AddressSchema # Importa o schema de endereço

class UserProfileSchema(Schema):
    id = fields.Integer(dump_only=True)
    name = fields.String(required=True, validate=validate.Length(min=1, max=150))
    email = fields.Email(required=True)
    phone = fields.String(required=True, validate=validate.Length(min=8, max=20))
    role = fields.String(dump_only=True) # Role é apenas para saída
    
    # Campos para atualização de senha (apenas para input, não para saída)
    current_password = fields.String(load_only=True, required=False)
    new_password = fields.String(load_only=True, required=False, validate=validate.Length(min=6))

    # Aninhamento de endereços para saída (opcional, pode ser feito separadamente)
    addresses = fields.List(fields.Nested(AddressSchema), dump_only=True)

class UserRegisterSchema(UserProfileSchema):
    # Campos de registro, incluindo senha e endereço (para criação)
    password = fields.String(required=True, load_only=True, validate=validate.Length(min=6))
    address = fields.Nested(AddressSchema, required=True) # Endereço obrigatório no registro

class UserLoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True, load_only=True)

# Instâncias para uso
user_profile_schema = UserProfileSchema()
user_register_schema = UserRegisterSchema()
user_login_schema = UserLoginSchema()