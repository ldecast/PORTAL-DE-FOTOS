const express  = require('express');
const router = new express.Router()
const controller = require('../controllers/controller')
const midelWare = require('../services/midelwate')

router.get('/',midelWare.verify,controller.holaMundo)
router.post('/login',controller.login)
router.get('/user',midelWare.verify,controller.getUser)
router.post('/user',controller.addUser)
router.post('/photo',midelWare.verify,controller.uploadPhoto)
//-----------------------------------------
router.delete('/photo',midelWare.verify,controller.deletePhoto)
router.route('/album').get(controller.getAlbum)
//router.delete('/user',midelWare.verify,controller.deleteUser)
//---------------------------------------------
router.put('/user',midelWare.verify,controller.updateUser)// pierde la ruta de las imagenes y no actualiza el usuario
// ----------------------------------------------
router.route('/photo').put(controller.updatePhoto)// doble no jala
router.route('/album').delete(controller.deleteAlbum)





module.exports = router