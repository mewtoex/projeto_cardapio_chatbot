class ApplicationException(Exception):
    """Base exception for application-specific errors."""
    status_code = 500
    message = "An unexpected error occurred."

    def __init__(self, message=None, errors=None):
        super().__init__(message)
        if message:
            self.message = message
        self.errors = errors if errors is not None else {}

class NotFoundError(ApplicationException):
    """Raised when a requested resource is not found."""
    status_code = 404
    message = "Resource not found."

class ConflictError(ApplicationException):
    """Raised when a resource conflicts with an existing resource."""
    status_code = 409
    message = "Resource already exists or conflicts with existing data."

class BadRequestError(ApplicationException):
    """Raised when the request data is invalid."""
    status_code = 400
    message = "Invalid request data."

class UnauthorizedError(ApplicationException):
    """Raised when authentication is required or credentials are invalid."""
    status_code = 401
    message = "Authentication required or invalid credentials."

class ForbiddenError(ApplicationException):
    """Raised when access to a resource is forbidden."""
    status_code = 403
    message = "Access denied."

class ServiceUnavailableError(ApplicationException):
    """Raised when an external service is unavailable."""
    status_code = 503
    message = "Service is temporarily unavailable. Please try again later."

class ValidationError(ApplicationException):
    status_code = 400
    def __init__(self, message="Validation failed", errors=None):
        super().__init__(message)
        self.errors = errors if errors is not None else {}