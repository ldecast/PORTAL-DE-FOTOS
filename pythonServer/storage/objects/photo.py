
class Photo:
    def __init__(self, url: str, albumName: str, username: str):
        self.url = url
        self.album = albumName
        self.username = username

    def getAlbumName(self) -> str:
        return self.album

    def getUsername(self) -> str:
        return self.username

    def getUrl(self) -> str:
        return self.url

    # De cambiarse el nombre de un album se deberían actualizar todas las rutas de fotos (no lo dice el enunciado)
    def setAlbumName(self, new_albumName: str):
        self.album = new_albumName

    def setUsername(self, new_username: str):
        self.username = new_username

    def setUrl(self, new_url: str):
        self.url = new_url

    def getFilename(self) -> str:
        url = self.getUrl()
        return url[url.rindex('/')+1:]

    def changeUsername(self, new_username: str):
        old_url = self.getUrl()
        new_url = old_url.replace(self.getUsername(), new_username, 1)
        self.setUsername(new_username)
        self.setUrl(new_url)
