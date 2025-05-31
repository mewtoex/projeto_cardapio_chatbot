# backend/src/api/serializers/bot_message_schema.py
from marshmallow import Schema, fields, validate

class BotMessageSchema(Schema):
    id = fields.Integer(dump_only=True)
    command = fields.String(required=True, validate=validate.Length(min=1, max=100))
    response_text = fields.String(required=True, validate=validate.Length(min=1))
    is_active = fields.Boolean(missing=True) # Default para True na entrada
    last_updated = fields.DateTime(dump_only=True)

# Instâncias para uso
bot_message_schema = BotMessageSchema()
# bot_messages_schema (para listas) já pode ser BotMessageSchema(many=True)