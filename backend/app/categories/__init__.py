from flask import Blueprint, jsonify, request
from app import db
from app.models import Category

categories_bp = Blueprint("categories", __name__)

@categories_bp.route("/", methods=["GET", "POST"])
def categ_operations():
    if request.method == "POST":
        return create_categ()
    else:
        return list_categ()


def create_categ():
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Dados inválidos"}), 400
    elif 'name' not in data:
        return jsonify({"error": "Campos 'name' é obrigatório"}), 400
    
    newcateg = Category(
        name=data['name'],
        description=data.get('description', None)
    )
    
    db.session.add(newcateg)
    db.session.commit()
    return jsonify({"msg": "categorie created", "categ_id": newcateg.id}), 201


def list_categ():
    categs = Category.query.all()
    return jsonify([{
        "id": categ.id,
        "name": categ.name,
        "description": categ.description
    } for categ in categs]), 200


@categories_bp.route("/<int:categ_id>", methods=["GET", "PUT", "DELETE"])
def categ_detail(categ_id):
    categ = Category.query.get(categ_id)
    
    if not categ:
        return jsonify({"error": "Categoria não encontrado"}), 404
    
    if request.method == "GET":
        return get_categ(categ)
    elif request.method == "PUT":
        return update_categ(categ)
    elif request.method == "DELETE":
        return delete_categ(categ)


def get_categ(categ):
    return jsonify({
        "id": categ.id,
        "name": categ.name,
        "description": categ.description
    }), 200


def update_categ(categ):
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Dados inválidos"}), 400
    
    categ.name = data.get('name', categ.name)
    categ.description = data.get('description', categ.description)
    
    db.session.commit()
    return jsonify({"msg": "categorie updated", "categ_id": categ.id}), 200


def delete_categ(categ):
    db.session.delete(categ)
    db.session.commit()
    return jsonify({"msg": "categorie deleted", "categ_id": categ.id}), 200