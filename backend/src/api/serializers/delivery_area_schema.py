# backend/src/api/serializers/delivery_area_schema.py
from marshmallow import Schema, fields, validate

class DeliveryAreaSchema(Schema):
    id = fields.Integer(dump_only=True)
    store_id = fields.Integer(dump_only=True) # Apenas para saída
    district_name = fields.String(required=True, validate=validate.Length(min=1, max=100))
    delivery_fee = fields.Float(required=True, validate=validate.Range(min=0.0))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

# Instâncias para uso
delivery_area_schema = DeliveryAreaSchema()
delivery_areas_schema = DeliveryAreaSchema(many=True)