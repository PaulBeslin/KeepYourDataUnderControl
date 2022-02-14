from genericpath import exists
from os import remove
import re
from typing import Text

from sqlalchemy import false, true
from config import BASE_HOST, DEFAULT_ACCSS_URL, RESOURCE_SUFFIX
from dao import (
    TextResourceDao,
    ImageResourceDao,
    ResourceIndexDao,
    ResourceAccessSiteDao
)

class ResourceService:
    def getAll(self):
        resourceIndexList = ResourceIndexDao().getAll()
        return self.generateList(resourceIndexList)

    def getResourceIndex(self, id):
        return ResourceIndexDao().getForceResourceIndex(id)

    def getResourceByOwnerId(self, ownerId):
        resourceIndexList = ResourceIndexDao().getResourceIndexListByOwnerId(ownerId)
        return self.generateList(resourceIndexList)

    def getResource(self, id, site=""):
        accessSite = ResourceAccessSiteDao().getResourceAccessSiteByResourceId(id)
        resourceIndex = self.getResourceIndex(id)
        if (resourceIndex == None):
            return ""
        
        permitted = True
        exist = resourceIndex.status != 0
        if (accessSite != None):
            accessSite = accessSite.access_site.split(";")
            if ((DEFAULT_ACCSS_URL not in accessSite) and (site not in accessSite)):
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

    def addResource(self, resource, ownerId, type, accessSite="all"):
        id = -1
        if (type == 1):
            id = ImageResourceService().addImageResource(resource)
            id = ResourceIndexDao().addResourceIndex(ownerId, id, type)
        elif (type == 2):
            id = TextResourceService().addTextResource(resource)
            id = ResourceIndexDao().addResourceIndex(ownerId, id, type)
        ResourceAccessSiteDao().addResourceAccessSite(accessSite, id)
        return id

    def removeResource(self, id):
        ResourceIndexDao().removeResource(id)

    def generateList(self, resourceIndexList):
        res = []
        for resourceIndex in resourceIndexList:
            resource = self.getResource(resourceIndex.resource_id)
            url = BASE_HOST + RESOURCE_SUFFIX + str(resourceIndex.id)
            resource = {"type": "", "data": url, "id": resourceIndex.id}
            if resourceIndex.data_type == 1:
                resource["type"] = "image"
            elif resourceIndex.data_type == 2:
                resource["type"] = "text"
            res.append(resource)
        
        return res


class ImageResourceService:
    def getImageResource(self, id):
        return ImageResourceDao().getResource(id)
    
    def addImageResource(self, resource):
        return ImageResourceDao().addImageResource(resource)

    def removeResource(self, id):
        ImageResourceDao().removeResource(id)


class TextResourceService:
    def getTextResource(self, id):
        return TextResourceDao().getResource(id)
    
    def addTextResource(self, resource):
        return TextResourceDao().addTextResource(resource)

    def removeResource(self, id):
        TextResourceDao().removeResource(id)
