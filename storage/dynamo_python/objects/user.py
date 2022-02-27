from objects.photo import Photo


class UserDB:
    def __init__(self, username: str, password: str, fullname: str):
        self.__username = username
        self.__password = password
        self.__fullname = fullname
        self.__photos = []

    def __str__(self) -> str:
        albums = ""
        urls = ""
        for photo in self.getPhotos():
            albums += (photo.getAlbumName()+", ")
            urls += (photo.getUrl()+"\n")
        return (f"[\nUsuario: {self.getUserName()}\n"
                f"Nombre: {self.getFullName()}\n"
                f"Albums:\n{albums[:-2]}\n"
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

    def addPhoto(self, url: str, albumName: str):
        new_photo = Photo(url, albumName, self.getUserName())
        self.__photos.append(new_photo)
