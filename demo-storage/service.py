from config import BASE_HOST, DEFAULT_ACCSS_URL, RESOURCE_SUFFIX, ACL_SUFFIX
from dao import (
    TextResourceDao,
    ImageResourceDao,
    ResourceIndexDao,
    ResourceAccessSiteDao
)

# Service for manage resource, controller doesn't need other service to manage service.
class ResourceService:
    def getAll(self):
        resourceIndexList = ResourceIndexDao().getAll()
        return self.generateList(resourceIndexList)

    def getResourceIndex(self, id):
        return ResourceIndexDao().getForceResourceIndexByUUID(id)

    def getResourceByOwnerId(self, ownerId):
        resourceIndexList = ResourceIndexDao().getResourceIndexListByOwnerId(ownerId)
        return self.generateList(resourceIndexList)

    def doGetResource(self, id):
        resourceIndex = self.getResourceIndex(id)
        if (resourceIndex == None):
            return ""
        
        exist = resourceIndex.status != 0
        if (resourceIndex.data_type == 1):
            if (exist == True):
                return ImageResourceService().getImageResource(resourceIndex.resource_id)
            else:
                img = ""
                # return an image for information
                with open("config/no_permission.png", 'rb') as file:
                    img = file.read()
                return img
        if (resourceIndex.data_type == 2):
            if (exist == True):
                return TextResourceService().getTextResource(resourceIndex.resource_id)
            else:
                return "Sorry, you don't have permission to access this resource"


    def getResource(self, id, site=""):
        resourceIndex = self.getResourceIndex(id)
        if (resourceIndex == None):
            return ""
        accessSiteList = ResourceAccessSiteService().getAccessSiteListByIndexId(id)
        permitted = True
        exist = resourceIndex.status != 0
        if (accessSiteList != None):
            if ((DEFAULT_ACCSS_URL not in accessSiteList) and (site not in accessSiteList)):
                permitted = False
 
        if (resourceIndex.data_type == 1):
            if (permitted == True and exist == True):
                return ImageResourceService().getImageResource(resourceIndex.resource_id)
            else:
                img = ""
                # return an image for information
                with open("config/no_permission.png", 'rb') as file:
                    img = file.read()
                return img
        if (resourceIndex.data_type == 2):
            if (permitted == True and exist == True):
                return TextResourceService().getTextResource(resourceIndex.resource_id)
            else:
                return "Sorry, you don't have permission to access this resource"
        
    def getResourceUrlOnVerifyingAcl(self, id, site=""):
        resourceIndex = self.getResourceIndex(id)
        if (resourceIndex == None):
            return ""
        accessSiteList = ResourceAccessSiteService().getAccessSiteListByIndexId(id)
        permitted = True
        exist = resourceIndex.status != 0
        if (accessSiteList != None):
            if ((DEFAULT_ACCSS_URL not in accessSiteList) and (site not in accessSiteList)):
                permitted = False
 
        if (resourceIndex.data_type == 1):
            if (permitted == True and exist == True):
                return BASE_HOST + RESOURCE_SUFFIX + "/" + resourceIndex.uuid
            else:
                return BASE_HOST + "/acl/deny/image"
        if (resourceIndex.data_type == 2):
            if (permitted == True and exist == True):
                return BASE_HOST + RESOURCE_SUFFIX + "/" + resourceIndex.uuid
            else:
                return BASE_HOST + "/acl/deny/text"

    def addResource(self, resource, ownerId, type, accessSite="all"):
        id = -1
        if (type == 1):
            id = ImageResourceService().addImageResource(resource)
            id = ResourceIndexDao().addResourceIndex(ownerId, id, type)
        elif (type == 2):
            id = TextResourceService().addTextResource(resource)
            id = ResourceIndexDao().addResourceIndex(ownerId, id, type)
        ResourceAccessSiteService().createAccessSite(accessSite, id)
        return id

    def removeResource(self, id):
        ResourceIndexDao().removeResourceByUUID(id)
        ResourceAccessSiteService().removeAccessSiteRecordByIndexId(id)

    def generateList(self, resourceIndexList):
        res = []
        for resourceIndex in resourceIndexList:
            indexId = str(resourceIndex.uuid)
            accessSiteList = ResourceAccessSiteService().getAccessSiteListByIndexId(indexId)
            url = BASE_HOST + ACL_SUFFIX + indexId
            resource = {"type": "", "data": url, "id": indexId, "accessSiteList": accessSiteList}
            if resourceIndex.data_type == 1:
                resource["type"] = "image"
            elif resourceIndex.data_type == 2:
                resource["type"] = "text"
            res.append(resource)
        
        return res


# Service to manage image resource. It normally is used by ResourceService
class ImageResourceService:
    def getImageResource(self, id):
        return ImageResourceDao().getResource(id)
    
    def addImageResource(self, resource):
        return ImageResourceDao().addImageResource(resource)

    def removeResource(self, id):
        ImageResourceDao().removeResource(id)

# Service to manage text resource. It normally is used by ResourceService
class TextResourceService:
    def getTextResource(self, id):
        return TextResourceDao().getResource(id)
    
    def addTextResource(self, resource):
        return TextResourceDao().addTextResource(resource)

    def removeResource(self, id):
        TextResourceDao().removeResource(id)

# Service to maange access list.
class ResourceAccessSiteService:
    def getAccessSiteListByIndexId(self, id):
        accessSite = ResourceAccessSiteDao().getResourceAccessSiteByResourceId(id)
        accessList = []
        if (accessSite != None and accessSite != ""):
            accessList = accessSite.access_site.split(";")
        if ("" in accessList):
            accessList.remove("")
        return accessList
    
    def updateAccessSiteByIndexId(self, indexId, site):
        # The database we used, sqlite, could not save directly an array
        # So the array is transfered into string with comma seperating each item (domain name)
        accessSite = ";".join(site)
        ResourceAccessSiteDao().updateResourceAccessSite(accessSite=accessSite, indexId=indexId)

    def createAccessSite(self, accessSite, indexId):
        ResourceAccessSiteDao().addResourceAccessSite(accessSite=accessSite, indexId=indexId)

    def removeAccessSiteRecordByIndexId(self, indexId):
        ResourceAccessSiteDao().removeResourceAccessSite(indexId==indexId)

    def addAccessSiteByIndexId(self, indexId, site):
        siteList = self.getAccessSiteListByIndexId(indexId)
        if site not in siteList:
            # update the database only if target site does not already exist in the list 
            siteList.append(site)
            self.updateAccessSiteByIndexId(indexId=indexId, site=siteList)
        return siteList
        
    def removeAccessSiteByIndexId(self, indexId, site):
        siteList = self.getAccessSiteListByIndexId(indexId)
        if site in siteList:
            # remove the domain name only if target site exists in the list 
            siteList.remove(site)
            self.updateAccessSiteByIndexId(indexId=indexId, site=siteList)
        return siteList
