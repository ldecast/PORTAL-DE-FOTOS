from objects.photo import Photo


class UserDB:
    def __init__(self, username: str, password: str, fullname: str):
        self.__username = username
        self.__password = password
        self.__fullname = fullname
        self.__photos = []

    def __str__(self) -> str:
        urls = ""
        for photo in self.getPhotos():
            urls += (photo.getUrl()+"\n")
        return (f"[\nUsuario: {self.getUserName()}\n"
                f"Nombre: {self.getFullName()}\n"
                f"Fotos:\n{urls}]")

    def getUserName(self) -> str:
        return self.__username

    def setUserName(self, new_username: str):
        self.__username = new_username

    def getPassword(self) -> str:
        return self.__password

    def setPassword(self, new_password: str):
        self.__password = new_password

    def getFullName(self) -> str:
        return self.__fullname

    def setFullName(self, new_fullname: str):
        self.__fullname = new_fullname

    def getPhotos(self) -> list:
        return self.__photos

    def addPhoto(self, url: str, tags: list):
        new_photo = Photo(url, tags, self.getUserName())
        self.__photos.append(new_photo)

    def getProfilePhoto(self) -> Photo:
        for photo in self.getPhotos():
            url = photo.getUrl()
            if "/actual/" in url:
                return photo
