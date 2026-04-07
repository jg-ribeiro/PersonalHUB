from flask import Blueprint, jsonify, request
from app import db
from models import HubApp

main = Blueprint("main", __name__)

@main.route("/")
def home():
    return jsonify({"msg": "ok"})

@main.route("/app", methods=["GET", "POST"])
def app_operations():
    if request.method == "POST":
        return create_app()
    else:
        return list_apps()


def create_app():
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Dados inválidos"}), 400
    elif 'name' not in data or 'link' not in data:
        return jsonify({"error": "Campos 'name' e 'link' são obrigatórios"}), 400
    
    newapp = HubApp(name=data['name'], description=data['description'], link=data['link'], icon=data.get('icon', None))
    db.session.add(newapp)
    db.session.commit()
    return jsonify({"msg": "app created", "app_id": newapp.id}), 201


def list_apps():
    apps = HubApp.query.all()
    return jsonify([{
        "id": app.id,
        "name": app.name,
        "description": app.description,
        "link": app.link,
        "icon": app.icon.hex() if app.icon else None
    } for app in apps]), 200


@main.route("/app/<int:app_id>", methods=["GET", "PUT", "DELETE"])
def app_detail(app_id):
    app = HubApp.query.get(app_id)
    
    if not app:
        return jsonify({"error": "App não encontrado"}), 404
    
    if request.method == "GET":
        return get_app(app)
    elif request.method == "PUT":
        return update_app(app)
    elif request.method == "DELETE":
        return delete_app(app)


def get_app(app):
    return jsonify({
        "id": app.id,
        "name": app.name,
        "description": app.description,
        "link": app.link,
        "icon": app.icon.hex() if app.icon else None
    }), 200


def update_app(app):
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Dados inválidos"}), 400
    
    app.name = data.get('name', app.name)
    app.description = data.get('description', app.description)
    app.link = data.get('link', app.link)
    if 'icon' in data:
        app.icon = data['icon']
    
    db.session.commit()
    return jsonify({"msg": "app updated", "app_id": app.id}), 200


def delete_app(app):
    db.session.delete(app)
    db.session.commit()
    return jsonify({"msg": "app deleted", "app_id": app.id}), 200