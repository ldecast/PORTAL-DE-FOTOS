
class Photo:
    def __init__(self, url: str, tags: list, username: str, description: str):
        self.url = url
        self.tags = tags
        self.username = username
        self.description = description

    def getTags(self) -> list:
        return self.tags

    def getUsername(self) -> str:
        return self.username

    def getUrl(self) -> str:
        return self.url

    def getDescription(self) -> str:
        return self.description

    def setTags(self, new_tags: list):
        self.tags = new_tags

    def setUsername(self, new_username: str):
        self.username = new_username

    def setUrl(self, new_url: str):
        self.url = new_url

    def setDescription(self, new_description: str):
        self.description = new_description

    def getFilename(self) -> str:
        url = self.getUrl()
        return url[url.rindex('/')+1:]

    def changeUsername(self, new_username: str):
        old_url = self.getUrl()
        new_url = old_url.replace(self.getUsername(), new_username, 1)
        self.setUsername(new_username)
        self.setUrl(new_url)
