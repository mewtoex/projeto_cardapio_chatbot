# backend/src/utils/error_handlers.py
from flask import jsonify
from werkzeug.exceptions import HTTPException
from marshmallow import ValidationError as MarshmallowValidationError
from src.domain.exceptions import ApplicationException, NotFoundError, ConflictError, BadRequestError, UnauthorizedError, ForbiddenError, ValidationError, ServiceUnavailableError

def handle_api_error(e):
    """
    Centraliza o tratamento de erros para a API, retornando respostas JSON consistentes.
    """
    if isinstance(e, MarshmallowValidationError):
        response = jsonify({"message": "Validation error", "errors": e.messages})
        response.status_code = 400
        return response
    elif isinstance(e, ApplicationException):
        response = jsonify({"message": e.message, "errors": e.errors if e.errors else None})
        response.status_code = e.status_code
        return response
    elif isinstance(e, HTTPException):
        response = jsonify({"message": e.description})
        response.status_code = e.code
        return response
    else:
        print(f"Unhandled exception: {e}") 
        response = jsonify({"message": "An unexpected error occurred. Please try again later."})
        response.status_code = 500
        return response

def register_error_handlers(app):
    """
    Registra os manipuladores de erro para o objeto Flask app.
    """
    app.errorhandler(NotFoundError)(handle_api_error)
    app.errorhandler(ConflictError)(handle_api_error)
    app.errorhandler(BadRequestError)(handle_api_error)
    app.errorhandler(UnauthorizedError)(handle_api_error)
    app.errorhandler(ForbiddenError)(handle_api_error)
    app.errorhandler(ServiceUnavailableError)(handle_api_error)
    app.errorhandler(ValidationError)(handle_api_error) 
    app.errorhandler(MarshmallowValidationError)(handle_api_error)
    app.errorhandler(Exception)(handle_api_error) 