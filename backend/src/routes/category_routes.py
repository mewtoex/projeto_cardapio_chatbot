from flask import Blueprint, request, jsonify
from src.models.category import db, Category

category_bp = Blueprint('category_bp', __name__, url_prefix='/api/categories')

# Create a new category
@category_bp.route('', methods=['POST'])
def create_category():
    data = request.get_json()
    if not data or not 'name' in data:
        return jsonify({'message': 'Missing category name'}), 400
    
    new_category = Category(name=data['name'], description=data.get('description'))
    try:
        db.session.add(new_category)
        db.session.commit()
        return jsonify(new_category.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error creating category', 'error': str(e)}), 500

# Get all categories
@category_bp.route('', methods=['GET'])
def get_categories():
    try:
        print('')
        categories = Category.query.all()
        return jsonify([category.to_dict() for category in categories]), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching categories', 'error': str(e)}), 500

# Get a specific category by ID
@category_bp.route('/<int:id>', methods=['GET'])
def get_category(id):
    try:
        category = Category.query.get_or_404(id)
        return jsonify(category.to_dict()), 200
    except Exception as e:
         # Handle cases where ID is not found (already handled by get_or_404) or other errors
        return jsonify({'message': 'Error fetching category', 'error': str(e)}), 500

# Update a category
@category_bp.route('/<int:id>', methods=['PUT'])
def update_category(id):
    category = Category.query.get_or_404(id)
    data = request.get_json()
    
    if 'name' in data:
        category.name = data['name']
    if 'description' in data:
        category.description = data['description']
        
    try:
        db.session.commit()
        return jsonify(category.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating category', 'error': str(e)}), 500

# Delete a category
@category_bp.route('/<int:id>', methods=['DELETE'])
def delete_category(id):
    category = Category.query.get_or_404(id)
    try:
        # Consider handling related items (e.g., prevent deletion if items exist)
        db.session.delete(category)
        db.session.commit()
        return jsonify({'message': 'Category deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting category', 'error': str(e)}), 500

