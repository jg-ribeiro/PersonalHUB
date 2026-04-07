from .extensions import db


class HubApp(db.Model):
    __tablename__ = "HUBAPPS"
    __table_args__ = {"schema": "personal_hub"}

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    link = db.Column(db.String(2048), nullable=False)
    icon = db.Column(db.LargeBinary, nullable=True)  # equivale a MEDIUMBLOB

    def __repr__(self):
        return f"<HubApp id={self.id} name={self.name}>"