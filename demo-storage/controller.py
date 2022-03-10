#from crypt import methods
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
    ResourceAccessSiteService
)
import json
from config import BASE_HOST, UPLOAD_FOLDER, DEFAULT_ACCSS_URL, RESOURCE_SUFFIX, ACL_SUFFIX
from werkzeug.utils import secure_filename

api = Blueprint('api', __name__, url_prefix="")


@api.route('/', methods=['GET'])
def homePage():
    return "Lucky You! This is da home page"

@api.route('/all/', methods=['GET'])
def getAll():
    resourceList = ResourceService().getAll()
    return jsonify(resourceList)

@api.route("/acl/deny/image", methods=['GET'])
def getDenyImage():
    img = ""
    # return an image for information
    with open("config/no_permission.png", 'rb') as file:
        img = file.read()
    return Response(img, mimetype="image/jpeg")

@api.route("/acl/deny/text", methods=['GET'])
def getDenyText():
    return jsonify("Sorry, you don't have permission to access this resource")

@api.route('/', methods=['POST'])
def uploadResource():
    if 'file' not in request.files:
        abort(Response("Missing file", 400))
    
    file = request.files['file']
    ownerId = request.form.get("owner_id")
    site = request.form.get("site")
    if (site == None or site == ""):
        # Default access url could be modified in config file
        # This is used for test
        site = DEFAULT_ACCSS_URL

    if file.filename == '':
        abort(Response("Empty filename", 400))

    filename = secure_filename(file.filename)
    # temporarily save file
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)
    extension = os.path.splitext(filename)[-1]
    res = ""
    # Following if statement is to judge the type of resources
    if extension == '.txt':
        with open(file_path) as file:
            text = file.read()
            id = ResourceService().addResource(text, ownerId, 2, site)
            if id != -1:
                url = BASE_HOST + ACL_SUFFIX + str(id)
                res = json.dumps({'url': url})
    if extension == '.jpg' or extension == '.png':
        # If it is an image, it should be opened with 'rb' mode
        with open(file_path, 'rb') as file:
            img = file.read()
            id = ResourceService().addResource(img, ownerId, 1, site)
            if id != -1:
                url = BASE_HOST + ACL_SUFFIX + str(id)
                res= json.dumps({'url': url})
    # remove temporary file
    os.remove(file_path)
    return res

@api.route(RESOURCE_SUFFIX + '<id>', methods=["GET"])
def getResourceGet(id):
    resourceService = ResourceService()
    resourceIndex = resourceService.getResourceIndex(id)
    resource = resourceService.doGetResource(id)
    if (resourceIndex.data_type == 1):
        resp = Response(resource, mimetype="image/jpeg")
        return resp
    if (resourceIndex.data_type == 2):
        return jsonify(resource)

@api.route(ACL_SUFFIX + '<id>', methods=["GET"])
def getResourcGetAcl(id):
    return getResourceGet(id)

# This function is to verify access list
# If the site passes the verification, a correct url to the resource will be returned
# Otherwise, the function will return an url towards the denied information (a text or an image)
# When frontend get this url, another request towards it will be sent to get the resource
@api.route(ACL_SUFFIX + '<id>', methods=["POST"])
def getResourcePostAcl(id):
    jsondata = request.get_data()
    print(jsondata)
    data = {"site":DEFAULT_ACCSS_URL}
    if (jsondata != None and jsondata != b''):
        data = json.loads(request.get_data())
    site = data.get("site")
    resourceService = ResourceService()
    url = resourceService.getResourceUrlOnVerifyingAcl(id, site=site)
    return jsonify({"url" : url})

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

@api.route("/updateAcl", methods=["POST"])
def updateAccessList():
    data = json.loads(request.get_data())
    id = data.get("id")
    accessSite = data.get("access_site")
    ResourceAccessSiteService().updateAccessSiteByIndexId(indexId=id, site=accessSite)
    return jsonify({"status": "ok"})

@api.route("/addAcl", methods=["POST"])
def addSiteAcl():
    data = json.loads(request.get_data())
    id = data.get("id")
    accessSite = data.get("access_site")
    siteList = ResourceAccessSiteService().addAccessSiteByIndexId(indexId=id, site=accessSite)
    return jsonify({"list": siteList})

@api.route("/removeAcl", methods=["DELETE"])
def removeSiteAcl():
    data = json.loads(request.get_data())
    id = data.get("id")
    accessSite = data.get("access_site")
    siteList = ResourceAccessSiteService().removeAccessSiteByIndexId(indexId=id, site=accessSite)
    return jsonify({"list": siteList})