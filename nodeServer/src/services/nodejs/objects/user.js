const Photo = require("./photo");

class UserDB {

    constructor(username, password, fullname) {
        this.__username = username;
        this.__password = password;
        this.__fullname = fullname;
        this.__photos = [];
    }

    printUser() {
        let albums = ""
        let urls = ""
        for (let i = 0; i < this.__photos.length; i++) {
            const photo = this.__photos[i];
            if (!albums.includes(photo.getAlbumName() + ", "))
                albums += (photo.getAlbumName() + ", ");
            urls += (photo.getUrl() + "\n")
        }
        return `[\nUsuario: ${this.__username}
Nombre: ${this.__fullname}
Albums:\n${albums.substring(0, albums.length - 2)}
Fotos:\n${urls}]`
    }

    getUserName() {
        return self.__username;
    }
    setUserName(new_username) {
        this.__username = new_username;
    }

    getPassword() {
        return this.__password;
    }
    setPassword(new_password) {
        this.__password = new_password;
    }

    getFullName() {
        return this.__fullname;
    }
    setFullName(new_fullname) {
        this.__fullname = new_fullname;
    }

    getPhotos() {
        return this.__photos;
    }
    addPhoto(url, albumName) {
        let new_photo = new Photo(url, albumName, this.__username);
        this.__photos.push(new_photo);
    }

    getProfilePhoto() {
        //console.log(this.__photos)
        for (let i = 0; i < this.__photos.length; i++) {
            const photo = this.__photos[i];
            let url = photo.getUrl();
            if (url.includes("/actual/"))
                return photo
        }
    }

}

module.exports = UserDB;
