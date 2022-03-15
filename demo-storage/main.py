import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

from config import UPLOAD_FOLDER, PORT


from controller import api
import ssl

# This application is devised into three parts:
#   1. Controller
#       Bind all routes. The file Projet3A.postman_collection.json could be imported
#       in Postman to have all useful api and examples of requests and responses.
#   2. Service
#       Offer necessary APIs to manage models.
#   3. Model
#       3.1 DAO : APIs to CRUD database
#       3.2 models: abstractions of database's tables.

def create_app():
    from models import db
    
    app = Flask(__name__)

    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'app.sqlite')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    with app.app_context():
        # Create all tables if needed. This doesn't work when updating the fields of a models, in
        # this case either make the ALTER TABLE by hand or delete the .db file
        db.create_all()

    CORS(app)
    app.config['UPLOAD_FOLDER'] = os.environ.get("API_UPLOAD_FOLDER", "./")
    app.register_blueprint(api)

    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(port=int(PORT))
