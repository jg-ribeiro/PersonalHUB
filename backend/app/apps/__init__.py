from flask import Blueprint, jsonify, request
from app import db
from app.models import HubApp, Category
import base64

apps_bp = Blueprint("apps", __name__)

@apps_bp.route("", methods=["GET", "POST"])
def app_operations():
    if request.method == "POST":
        return create_app()
    else:
        return list_apps()


def create_app():
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Dados inválidos"}), 400
    elif 'name' not in data or 'link' not in data or 'categorie_id' not in data:
        return jsonify({"error": "Campos 'categorie_id', 'name' e 'link' são obrigatórios"}), 400
    
    newapp = HubApp(
        categorie_id=data['categorie_id'],
        name=data['name'],
        description=data.get('description', None),
        link=data['link']
    )
    
    if 'icon' in data and data['icon']:
        newapp.icon = base64.b64decode(data['icon'])
    
    db.session.add(newapp)
    db.session.commit()
    return jsonify({"msg": "app created", "app_id": newapp.id}), 201


def list_apps():
    categs = Category.query.all()

    result = []

    for categ in categs:
        apps_list = []

        for app in categ.apps:
            apps_list.append({
                "id": app.id,
                "name": app.name,
                "description": app.description,
                "link": app.link,
                "icon": base64.b64encode(app.icon).decode() if app.icon else None
            })

        result.append({
            "id": categ.id,
            "name": categ.name,
            "description": categ.description,
            "apps": apps_list
        })

    return jsonify(result), 200


@apps_bp.route("/<int:app_id>", methods=["GET", "PUT", "DELETE"])
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
        "icon": base64.b64encode(app.icon).decode() if app.icon else None
    }), 200


def update_app(app):
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Dados inválidos"}), 400
    
    app.categorie_id = data.get('categorie_id', app.categorie_id)
    app.name = data.get('name', app.name)
    app.description = data.get('description', app.description)
    app.link = data.get('link', app.link)
    if 'icon' in data and data['icon']:
        app.icon = base64.b64decode(data['icon'])
    
    db.session.commit()
    return jsonify({"msg": "app updated", "app_id": app.id}), 200


def delete_app(app):
    db.session.delete(app)
    db.session.commit()
    return jsonify({"msg": "app deleted", "app_id": app.id}), 200