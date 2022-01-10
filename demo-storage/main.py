import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

from controller import api
import ssl

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
    load_dotenv()

    CORS(app)
    app.config['UPLOAD_FOLDER'] = os.environ.get("API_UPLOAD_FOLDER", "./")
    app.register_blueprint(api)
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(port=int(os.environ.get('FLASK_PORT', 5001)))
