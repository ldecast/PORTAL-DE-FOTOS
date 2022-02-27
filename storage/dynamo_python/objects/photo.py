
class Photo:
    def __init__(self, url: str, albumName: str, username: str):
        self.__url = url
        self.__albumName = albumName
        self.__username = username

    def getAlbumName(self) -> str:
        return self.__albumName

    def getUsername(self) -> str:
        return self.__username

    def getUrl(self) -> str:
        return self.__url

    # De cambiarse el nombre de un album se deberían actualizar todas las rutas de fotos
    def setAlbumName(self, new_albumName: str):
        self.__albumName = new_albumName
