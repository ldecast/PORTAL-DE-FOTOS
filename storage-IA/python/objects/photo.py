
class Photo:
    def __init__(self, url: str, tags: list, username: str, description: str):
        self.__url = url
        self.__tags = tags
        self.__username = username
        self.__description = description

    def getTags(self) -> list:
        return self.__tags

    def getUsername(self) -> str:
        return self.__username

    def getUrl(self) -> str:
        return self.__url

    def getDescription(self) -> str:
        return self.__description

    def setTags(self, new_tags: list):
        self.__tags = new_tags

    def setUsername(self, new_username: str):
        self.__username = new_username

    def setUrl(self, new_url: str):
        self.__url = new_url

    def setDescription(self, new_description: str):
        self.__description = new_description

    def getFilename(self) -> str:
        url = self.getUrl()
        return url[url.rindex('/')+1:]

    def changeUsername(self, new_username: str):
        old_url = self.getUrl()
        new_url = old_url.replace(self.getUsername(), new_username, 1)
        self.setUsername(new_username)
        self.setUrl(new_url)
