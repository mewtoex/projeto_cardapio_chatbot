# backend/src/main.py
import os
import sys

# Garante que o diretório 'backend' (pai de 'src') é adicionado ao sys.path.
# Isso é crucial para importações como 'from src.app_factory import create_app'
# e para que os submódulos dentro de 'src' se resolvam corretamente.
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# --- Ponto de Depuração ---
print("\n--- Conteúdo de sys.path (após ajuste) ---")
for p in sys.path:
    print(p)
print("--------------------------\n")
# --- Fim do Ponto de Depuração ---

from src.app_factory import create_app # O import aqui permanece o mesmo

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug_mode = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug_mode)