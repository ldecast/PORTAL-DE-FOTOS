
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

    # De cambiarse el nombre de un album se deberían actualizar todas las rutas de fotos (no lo dice el enunciado)
    def setAlbumName(self, new_albumName: str):
        self.__albumName = new_albumName

    def setUsername(self, new_username: str):
        self.__username = new_username

    def setUrl(self, new_url: str):
        self.__url = new_url

    def getFilename(self) -> str:
        url = self.getUrl()
        return url[url.rindex('/')+1:]

    def changeUsername(self, new_username: str):
        old_url = self.getUrl()
        new_url = old_url.replace(self.getUsername(), new_username, 1)
        self.setUsername(new_username)
        self.setUrl(new_url)
