from flask import Flask
from .extensions import db, create_db_url
from dotenv import load_dotenv
import os

load_dotenv()

def create_app():
    app = Flask(__name__)

    _DBCONF = {
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD", ""),
        "host": os.getenv("DB_HOST", "localhost"),
        "port": os.getenv("DB_PORT", 3306),
        "name": os.getenv("DB_NAME", "personalhub")
    }

    # Configurações do banco de dados
    app.config["SQLALCHEMY_DATABASE_URI"] = create_db_url(_DBCONF)
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Inicializa extensões
    db.init_app(app)

    # Registrar rotas / blueprints
    from .routes import main
    app.register_blueprint(main)

    return app