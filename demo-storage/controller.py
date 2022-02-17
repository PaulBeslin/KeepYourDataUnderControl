import os

from flask import (
    abort,
    Blueprint,
    json,
    jsonify,
    request,
    Response,
)
from service import (
    ResourceService,
)
import json
from config import BASE_HOST, UPLOAD_FOLDER, DEFAULT_ACCSS_URL, RESOURCE_SUFFIX
from werkzeug.utils import secure_filename

api = Blueprint('api', __name__, url_prefix="")


@api.route('/', methods=['GET'])
def homePage():
    return "Lucky You! This is da home page"

@api.route('/all/', methods=['GET'])
def getAll():
    resourceList = ResourceService().getAll()
    return jsonify(resourceList)

@api.route('/', methods=['POST'])
def uploadResource():
    if 'file' not in request.files:
        abort(Response("Missing file", 400))
    
    file = request.files['file']
    ownerId = request.form.get("owner_id")
    site = request.form.get("site")
    if (site == None or site == ""):
        site = DEFAULT_ACCSS_URL

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
            id = ResourceService().addResource(text, ownerId, 2, site)
            if id != -1:
                url = BASE_HOST + RESOURCE_SUFFIX + str(id)
                res = json.dumps({'url': url})
    if extension == '.jpg':
        with open(file_path, 'rb') as file:
            img = file.read()
            id = ResourceService().addResource(img, ownerId, 1, site)
            if id != -1:
                url = BASE_HOST + RESOURCE_SUFFIX + str(id)
                res= json.dumps({'url': url})
    os.remove(file_path)
    return res

@api.route(RESOURCE_SUFFIX + '<id>', methods=["GET"])
def getResourcGet(id):
    resourceService = ResourceService()
    resourceIndex = resourceService.getResourceIndex(id)
    resource = resourceService.doGetResource(id)
    if (resourceIndex.data_type == 1):
        resp = Response(resource, mimetype="image/jpeg")
        return resp
    if (resourceIndex.data_type == 2):
        return jsonify(resource)

@api.route(RESOURCE_SUFFIX + '<id>', methods=["POST"])
def getResourcePost(id):
    site = request.form.get("site")
    resourceService = ResourceService()
    resourceIndex = resourceService.getResourceIndex(id)
    resource = resourceService.getResource(id, site=site)
    if (resourceIndex.data_type == 1):
        resp = Response(resource, mimetype="image/jpeg")
        return resp
    if (resourceIndex.data_type == 2):
        return jsonify(resource)

@api.route('/remove/', methods=["DELETE"])
def removeResource():
    data = json.loads(request.get_data())
    id = data.get("id")
    resourceService = ResourceService()
    resourceService.removeResource(id)
    return jsonify({"status":"ok"})
    
@api.route('/owner/<id>')
def getResourceByOwnerId(id):
    # return an array of resource 
    resourceList = ResourceService().getResourceByOwnerId(id)
    return jsonify(resourceList)
