const express  = require('express');
const router = new express.Router()
const controller = require('../controllers/controller')
const midelWare = require('../services/midelwate')

// ----------- RUTAS TERMINADAS ---------------
router.get('/',midelWare.verify,controller.holaMundo)
router.post('/login',controller.login)
router.get('/user',midelWare.verify,controller.getUser)
router.post('/user',controller.addUser)
router.post('/photo',midelWare.verify,controller.uploadPhoto)
router.delete('/photo',midelWare.verify,controller.deletePhoto)
router.put('/photo',midelWare.verify,controller.updatePhotoFix)
router.get('/album/:albumname',midelWare.verify,controller.getAlbum)
router.delete('/album/:albumname',midelWare.verify,controller.deleteAlbum)
//--------------------- REVISARLAS
router.put('/user',midelWare.verify,controller.updateUser) // a veces se pierde la foto de perfil
//---------------- IMPLEMENTADA PERO NO SOLICITADA
//router.delete('/user',midelWare.verify,controller.deleteUser)





module.exports = router