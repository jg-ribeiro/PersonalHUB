from .extensions import db

class Category(db.Model):
    __tablename__ = "CATEGORIES"
    __table_args__ = {"schema": "personal_hub"}

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255), nullable=True)

    apps = db.relationship(
        "HubApp",
        back_populates="category",
        cascade="all, delete",
        passive_deletes=True
    )

    def __repr__(self):
        return f"<Category id={self.id} name={self.name}>"


class HubApp(db.Model):
    __tablename__ = "HUBAPPS"
    __table_args__ = {"schema": "personal_hub"}

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    link = db.Column(db.String(2048), nullable=False)
    icon = db.Column(db.LargeBinary, nullable=True)

    categorie_id = db.Column(
        db.Integer,
        db.ForeignKey("personal_hub.CATEGORIES.id", ondelete="CASCADE"),
        nullable=False
    )

    category = db.relationship("Category", back_populates="apps")

    def __repr__(self):
        return f"<HubApp id={self.id} name={self.name}>"