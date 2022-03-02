
class Photo {
    constructor(url, albumName, username) {
        this.__url = url;
        this.__albumName = albumName;
        this.__username = username;
    }

    getAlbumName() {
        return this.__albumName;
    }
    getUsername() {
        return this.__username;
    }
    getUrl() {
        return this.__url;
    }

    // De cambiarse el nombre de un album se deberían actualizar todas las rutas de fotos
    setAlbumName(new_albumName) {
        this.__albumName = new_albumName;
    }
    setUsername(new_username) {
        this.__username = new_username;
    }
    setUrl(new_url) {
        this.__url = new_url;
    }

    getFilename() {
        let url = this.getUrl();
        return url.substring(url.lastIndexOf('/') + 1);
    }

    changeUsername(new_username) {
        let old_url = this.getUrl();
        let new_url = old_url.replace(this.getUsername(), new_username);
        this.setUsername(new_username);
        this.setUrl(new_url);
    }
}

module.exports = Photo;
