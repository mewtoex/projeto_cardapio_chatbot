from marshmallow import Schema, fields, validate

class CategorySchema(Schema):
    id = fields.Integer(dump_only=True)
    name = fields.String(required=True, validate=validate.Length(min=1, max=80))
    description = fields.String(validate=validate.Length(max=200), allow_none=True)

category_schema = CategorySchema()
categories_schema = CategorySchema(many=True)