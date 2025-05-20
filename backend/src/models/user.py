from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

# Mantendo a instância db aqui, mas ela será inicializada no main.py ou em um arquivo de config central
# Para evitar importações circulares e garantir que todos os modelos usem a mesma instância db,
# é comum definir db = SQLAlchemy() em um arquivo central (ex: extensions.py ou no próprio app.py antes de qualquer import de modelo)
# e então importar essa instância db nos modelos.
# Por agora, vamos assumir que o db de category.py ou menu_item.py é o global.
# Idealmente, isso seria refatorado para um db centralizado.

# Temporariamente, para desenvolvimento e evitar erro de db não definido, vamos usar o db de category
# Isto será ajustado quando refatorarmos para um db central.
from .category import db # Supondo que category.py define o db globalmente por enquanto

class User(db.Model):
    __tablename__ = "users" # Definindo explicitamente o nome da tabela

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    password_hash = db.Column(db.String(256), nullable=False) # Aumentado para hashes mais longos
    role = db.Column(db.String(20), nullable=False, default='client') # client, admin

    # Relacionamentos
    addresses = db.relationship('Address', backref='user', lazy='dynamic')
    orders = db.relationship('Order', backref='user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.name} ({self.email})>'

    def to_dict(self, include_addresses=False, include_orders=False):
        data = {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role
        }
        if include_addresses:
            data['addresses'] = [address.to_dict() for address in self.addresses]
        if include_orders:
            # Cuidado com a serialização de muitos pedidos, pode ser pesado
            data['orders'] = [order.to_short_dict() for order in self.orders] # Usar um to_short_dict para pedidos
        return data

# Se db não estiver definido em category.py ou menu_item.py de forma global, 
# precisaremos de uma definição central de db = SQLAlchemy() e importá-la aqui.
# Por exemplo, criar um arquivo extensions.py com `db = SQLAlchemy()`
# e depois em cada modelo: `from .extensions import db`

