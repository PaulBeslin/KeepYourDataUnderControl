from email.policy import default
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.sqlite import BLOB
from werkzeug.utils import secure_filename



db = SQLAlchemy()

# All the statu fields in the model is to mark if the record is delted
# If status is 0, it means that the resource is delted
# This field is to maintain the possibility to withdraw wrong delete operation by users

class ResourceAccessSite(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    resource_id = db.Column(db.Integer)
    access_site = db.Column(db.String())
    created_time = db.Column(db.DateTime())
    last_modified_time = db.Column(db.DateTime())
    status = db.Column(db.Integer)

class ResourceIndex(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    uuid = db.Column(db.String())
    # it means the resource is an image if data_type is 1
    # the resource is a text when data_type is 2 
    data_type = db.Column(db.Integer)
    resource_id = db.Column(db.Integer)
    created_time = db.Column(db.DateTime())
    owner_id = db.Column(db.Integer)
    last_modified_time = db.Column(db.DateTime())
    status = db.Column(db.Integer, default=1)

class TextResource(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    resource = db.Column(db.String())
    status = db.Column(db.Integer, default=1)
    created_time = db.Column(db.DateTime())
    last_modified_time = db.Column(db.DateTime())

class ImageResource(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    resource = db.Column(BLOB)
    status = db.Column(db.Integer, default=1)
    created_time = db.Column(db.DateTime())
    last_modified_time = db.Column(db.DateTime())