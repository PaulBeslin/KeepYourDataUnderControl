from typing import Text
from config import BASE_HOST
from dao import (
    TextResourceDao,
    ImageResourceDao,
    ResourceIndexDao
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

    def getResource(self, id):
        resourceIndex = self.getResourceIndex(id)
        if (resourceIndex == None):
            return ""
        if (resourceIndex.data_type == 1):
            return ImageResourceService().getImageResource(resourceIndex.resource_id)
        if (resourceIndex.data_type == 2):
            return TextResourceService().getTextResource(resourceIndex.resource_id)


class ImageResourceService:
    def getImageResource(self, id):
        return ImageResourceDao().getResource(id)
    
    def addImageResource(self, resource, ownerId):
        id = ImageResourceDao().addImageResource(resource)
        indexId = ResourceIndexDao().addResourceIndex(ownerId, id, 1)
        return indexId


class TextResourceService:
    def getTextResource(self, id):
        return TextResourceDao().getResource(id)
    
    def addTextResource(self, resource, ownerId):
        id = TextResourceDao().addTextResource(resource)
        indexId = ResourceIndexDao().addResourceIndex(ownerId, id, 2)
        return indexId