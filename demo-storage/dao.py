from datetime import datetime
import uuid
from models import (
    db,
    ResourceIndex,
    TextResource,
    ImageResource,
    ResourceAccessSite
)

class ResourceAccessSiteDao:
    def getResourceAccessSiteByResourceId(self, indexId):
        if (id == None) :
            return None
        return db.session.query(ResourceAccessSite).filter(ResourceAccessSite.resource_id == indexId).filter(ResourceAccessSite.status==1).one_or_none()

    def addResourceAccessSite(self, accessSite, indexId):
        resourceAccessSite = ResourceAccessSite(resource_id=indexId, access_site=accessSite, created_time=datetime.now(), last_modified_time=datetime.now(), status=1)
        db.session.add(resourceAccessSite)
        db.session.commit()
        db.session.refresh(resourceAccessSite)
        return resourceAccessSite.id

    def updateResourceAccessSite(self, accessSite, indexId):
        record = db.session.query(ResourceAccessSite).filter(ResourceAccessSite.resource_id == indexId).filter(ResourceAccessSite.status==1).one_or_none()
        if (record == None):
            return
        db.session.query(ResourceAccessSite).filter(ResourceAccessSite.resource_id == indexId).filter(ResourceAccessSite.status==1).update({"access_site": accessSite, "last_modified_time":datetime.now()}, synchronize_session=False)
        db.session.commit()

    def removeResourceAccessSite(self, indexId):
        accessSite = db.session.query(ResourceAccessSite).filter(ResourceAccessSite.resource_id == indexId).filter(ResourceAccessSite.status==1).one_or_none()
        if (accessSite == None):
            return
        db.session.query(ResourceAccessSite).filter(ResourceAccessSite.resource_id == indexId).filter(ResourceAccessSite.status==1).update({"status": 0, "last_modified_time":datetime.now()}, synchronize_session=False)
        db.session.commit()

class ResourceIndexDao:
    def getAll(self):
        return db.session.query(ResourceIndex).filter(ResourceIndex.status == 1).all()

    def getResourceIndexByUUID(self, uuid):
        if (uuid == None):
            return None
        return db.session.query(ResourceIndex).filter(ResourceIndex.uuid == uuid).filter(ResourceIndex.status == 1).one_or_none()

    def getForceResourceIndexByUUID(self, uuid):
        if (uuid == None):
            return None
        return db.session.query(ResourceIndex).filter(ResourceIndex.uuid == uuid).one_or_none()


    def getResourceIndex(self, id):
        if (id == None):
            return None
        return db.session.query(ResourceIndex).filter(ResourceIndex.id == id).filter(ResourceIndex.status == 1).one_or_none()
    
    def getForceResourceIndex(self, id):
        if (id == None):
            return None
        return db.session.query(ResourceIndex).filter(ResourceIndex.id == id).one_or_none()

    def getResourceIndexListByOwnerId(self, ownerId):
        if (ownerId == None):
            return None
        return db.session.query(ResourceIndex).filter(ResourceIndex.owner_id == ownerId).filter(ResourceIndex.status == 1).all()

    def addResourceIndex(self, ownerId, resourceId, type):
        uuidstr = str(uuid.uuid4())
        resourceIndex = ResourceIndex(resource_id=resourceId, uuid=uuidstr, owner_id=ownerId, data_type=type, created_time=datetime.now(), last_modified_time=datetime.now(), status=1)
        db.session.add(resourceIndex)
        db.session.commit()
        # db.session.refresh(resourceIndex)
        return uuidstr

    def removeResourceByUUID(self, uuid):
        index = db.session.query(ResourceIndex).filter(ResourceIndex.uuid == uuid).filter(ResourceIndex.status == 1).one_or_none()
        if (index == None):
            return
        if (index.data_type == 1):
            ImageResourceDao().removeResource(index.resource_id)
        if (index.data_type == 2):
            TextResourceDao().removeResource(index.resource_id)
        db.session.query(ResourceIndex).filter(ResourceIndex.uuid == uuid).filter(ResourceIndex.status == 1).update({"status":0, "last_modified_time":datetime.now()}, synchronize_session=False)
        db.session.commit()
    
    def removeResource(self, id):
        index = db.session.query(ResourceIndex).filter(ResourceIndex.id == id).filter(ResourceIndex.status == 1).one_or_none()
        if (index == None):
            return
        if (index.data_type == 1):
            ImageResourceDao().removeResource(index.resource_id)
        if (index.data_type == 2):
            TextResourceDao().removeResource(index.resource_id)
        db.session.query(ResourceIndex).filter(ResourceIndex.id == id).filter(ResourceIndex.status == 1).update({"status":0, "last_modified_time":datetime.now()}, synchronize_session=False)
        db.session.commit()

class TextResourceDao:
    def getTextResource(self, id):
        if (id == None):
            return None
        return db.session.query(TextResource).filter(TextResource.id == id).filter(TextResource.status == 1).one_or_none()
    
    def getResource(self, id):
        textResource = self.getTextResource(id)
        if (textResource == None):
            return ""
        else:
            return textResource.resource

    def addTextResource(self, resource):
        textResource = TextResource(resource=resource, status=1, created_time=datetime.now(), last_modified_time=datetime.now())
        db.session.add(textResource)
        db.session.commit()
        db.session.refresh(textResource)
        return textResource.id
    
    def removeResource(self, id):
        db.session.query(TextResource).filter(TextResource.id == id).filter(TextResource.status == 1).update({"status":0, "last_modified_time":datetime.now()}, synchronize_session='fetch')
        db.session.commit()

class ImageResourceDao:
    def getImageResource(self, id):
        if (id == None):
            return None
        return db.session.query(ImageResource).filter(ImageResource.id == id).filter(ImageResource.status == 1).one_or_none()
    
    def getResource(self, id):
        imageReousrce = self.getImageResource(id)
        if (imageReousrce == None):
            return ""
        else:
            return imageReousrce.resource

    def addImageResource(self, resource):
        imageReousrce = ImageResource(resource=resource, status=1, created_time=datetime.now(), last_modified_time=datetime.now())
        db.session.add(imageReousrce)
        db.session.commit()
        db.session.refresh(imageReousrce)
        return imageReousrce.id
    
    def removeResource(self, id):
        db.session.query(ImageResource).filter(ImageResource.id == id).filter(ImageResource.status == 1).update({"status":0, "last_modified_time":datetime.now()}, synchronize_session='fetch')
        db.session.commit()