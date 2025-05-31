# backend/src/api/serializers/addon_schema.py
from marshmallow import Schema, fields, validate

class AddonOptionSchema(Schema):
    id = fields.Integer(dump_only=True)
    addon_category_id = fields.Integer(dump_only=True)
    name = fields.String(required=True, validate=validate.Length(min=1, max=100))
    price = fields.Float(required=True, validate=validate.Range(min=0.0))

class AddonCategorySchema(Schema):
    id = fields.Integer(dump_only=True)
    name = fields.String(required=True, validate=validate.Length(min=1, max=80))
    min_selections = fields.Integer(required=True, validate=validate.Range(min=0))
    max_selections = fields.Integer(required=True, validate=validate.Range(min=0))
    is_required = fields.Boolean(missing=False)
    options = fields.List(fields.Nested(AddonOptionSchema), dump_only=True) # Aninha as opções

# Instâncias para uso
addon_option_schema = AddonOptionSchema()
addon_options_schema = AddonOptionSchema(many=True)
addon_category_schema = AddonCategorySchema()
addon_categories_schema = AddonCategorySchema(many=True)