from flask_sqlalchemy import SQLAlchemy

# Criação de extensões (para import em módulos)
db = SQLAlchemy()

def create_db_url(db_params):
    return f"mysql+pymysql://{db_params['user']}:{db_params['password']}@{db_params['host']}:{db_params['port']}/{db_params['name']}"