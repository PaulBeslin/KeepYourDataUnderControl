from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.sqlite import BLOB
from werkzeug.utils import secure_filename



db = SQLAlchemy()

class ResourceAccessSite(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    resource_id = db.Column(db.Integer)
    access_site = db.Column(db.String())
    created_time = db.Column(db.DateTime())
    last_modified_time = db.Column(db.DateTime())

class ResourceIndex(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    data_type = db.Column(db.Integer)
    resource_id = db.Column(db.Integer)
    created_time = db.Column(db.DateTime())
    owner_id = db.Column(db.Integer)
    last_modified_time = db.Column(db.DateTime())

class TextResource(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    resource = db.Column(db.String())
    status = db.Column(db.Integer)
    created_time = db.Column(db.DateTime())
    last_modified_time = db.Column(db.DateTime())

class ImageResource(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    resource = db.Column(BLOB)
    status = db.Column(db.Integer)
    created_time = db.Column(db.DateTime())
    last_modified_time = db.Column(db.DateTime())