import re
from typing import Text

from sqlalchemy import false, true
from config import BASE_HOST, DEFAULT_ACCSS_URL
from dao import (
    TextResourceDao,
    ImageResourceDao,
    ResourceIndexDao,
    ResourceAccessSiteDao
)

class ResourceService:
    def getResourceIndex(self, id):
        return ResourceIndexDao().getResourceIndex(id)

    def getResourceByOwnerId(self, ownerId):
        resourceIndexList = ResourceIndexDao().getResourceIndexListByOwnerId(ownerId)
        res = []
        for resourceIndex in resourceIndexList:
            resource = self.getResource(resourceIndex.resource_id)
            url = BASE_HOST + "/resource/" + str(resourceIndex.id)
            if resourceIndex.data_type == 1:
                resource = {"type": "image", "data": url}
            elif resourceIndex.data_type == 2:
                resource = {"type": "text", "data": url}
            res.append(resource)
        
        return res

    def doGetResource(self, id):
        resourceIndex = self.getResourceIndex(id)
        if (resourceIndex == None):
            return ""
        if (resourceIndex.data_type == 1):
            return ImageResourceService().getImageResource(resourceIndex.resource_id)
        if (resourceIndex.data_type == 2):
            return TextResourceService().getTextResource(resourceIndex.resource_id)

    def getResource(self, id, site=""):
        accessSite = ResourceAccessSiteDao().getResourceAccessSiteByResourceId(id)
        resourceIndex = self.getResourceIndex(id)
        permitted = true
        if (accessSite != None):
            accessSite = accessSite.access_site.split(";")
            # print(accessSite)
            if (DEFAULT_ACCSS_URL not in accessSite and site not in accessSite):
                permitted = false
        if (resourceIndex == None):
            return ""
        if (resourceIndex.data_type == 1):
            if (permitted == true):
                return ImageResourceService().getImageResource(resourceIndex.resource_id)
            else:
                img = ""
                # return an image for information
                with open("config/no_permission.png", 'rb') as file:
                    img = file.read()
                return img
        if (resourceIndex.data_type == 2):
            if (permitted == true):
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


class ImageResourceService:
    def getImageResource(self, id):
        return ImageResourceDao().getResource(id)
    
    def addImageResource(self, resource):
        return ImageResourceDao().addImageResource(resource)


class TextResourceService:
    def getTextResource(self, id):
        return TextResourceDao().getResource(id)
    
    def addTextResource(self, resource):
        return TextResourceDao().addTextResource(resource)