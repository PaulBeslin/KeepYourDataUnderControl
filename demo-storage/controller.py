import os

from flask import (
    abort,
    Flask,
    Blueprint,
    json,
    jsonify,
    request,
    Response,
)
from service import (
    ResourceService,
    TextResourceService,
    ImageResourceService
)
import json
from config import BASE_HOST, UPLOAD_FOLDER
from werkzeug.utils import secure_filename
import base64


api = Blueprint('api', __name__, url_prefix="")


@api.route('/', methods=['GET'])
def homePage():
    return "Lucky You! This is da home page"

@api.route('/', methods=['POST'])
def uploadResource():
    if 'file' not in request.files:
        abort(Response("Missing file", 400))
    
    file = request.files['file']
    ownerId = request.form.get("owner_id")

    if file.filename == '':
        abort(Response("Empty filename", 400))

    filename = secure_filename(file.filename)
    # temporarily save file
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)
    extension = os.path.splitext(filename)[-1]
    res = ""
    if extension == '.txt':
        with open(file_path) as file:
            text = file.read()
            id = TextResourceService().addTextResource(text, ownerId)
            if id != -1:
                url = BASE_HOST + "/resource/" + str(id)
                res = json.dumps({'url': url})
    if extension == '.jpg':
        with open(file_path, 'rb') as file:
            img = file.read()
            id = ImageResourceService().addImageResource(img, ownerId)
            if id != -1:
                url = BASE_HOST + "/resource/" + str(id)
                res= json.dumps({'url': url})
    os.remove(file_path)
    return res

@api.route('/resource/<id>')
def getResource(id):
    resourceService = ResourceService()
    resourceIndex = resourceService.getResourceIndex(id)
    resource = resourceService.getResource(id)
    if (resourceIndex.data_type == 1):
        resp = Response(resource, mimetype="image/jpeg")
        return resp
    if (resourceIndex.data_type == 2):
        return jsonify(resource)
    
@api.route('/owner/<id>')
def getResourceByOwnerId(id):
    # return an array of resource 
    resourceList = ResourceService().getResourceByOwnerId(id)
    return jsonify(resourceList)
