from .photo import Photo


class UserDB:
    def __init__(self, username: str, password: str, fullname: str):
        self.username = username
        self.password = password
        self.fullname = fullname
        self.photos = []

    def __str__(self) -> str:
        data = ""
        for photo in self.getPhotos():
            data += (photo.getUrl()+" ---> "+photo.getDescription()+"\n")
        return (f"[\nUsuario: {self.getUserName()}\n"
                f"Nombre: {self.getFullName()}\n"
                f"Fotos:\n{data}]")

    def getUserName(self) -> str:
        return self.username

    def setUserName(self, new_username: str):
        self.username = new_username

    def getPassword(self) -> str:
        return self.password

    def setPassword(self, new_password: str):
        self.password = new_password

    def getFullName(self) -> str:
        return self.fullname

    def setFullName(self, new_fullname: str):
        self.fullname = new_fullname

    def getPhotos(self) -> list:
        return self.photos

    def addPhoto(self, url: str, tags: list, description: str):
        new_photo = Photo(url, tags, self.getUserName(), description)
        self.photos.append(new_photo)

    def getProfilePhoto(self) -> Photo:
        for photo in self.getPhotos():
            url = photo.getUrl()
            if "/actual/" in url:
                return photo
