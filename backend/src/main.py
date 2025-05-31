# backend/src/main.py
import os
import sys

# Garante que o diretório 'src' é a primeira entrada no sys.path
# Isso faz com que Python o trate como a raiz para imports como 'src.infra...'
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

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