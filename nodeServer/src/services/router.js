const express  = require('express');
const router = new express.Router()
const controller = require('../controllers/controller')

router.route('/').get(controller.holaMundo)
router.route('/user').post(controller.addUser)
router.route('/login').post(controller.login)
router.route('/user').get(controller.getUser)
router.route('/photo').post(controller.uploadPhoto)
router.route('/photo').delete(controller.deletePhoto)
router.route('/album').get(controller.getAlbum)
//router.route('/user').delete(controller.deleteUser)
//---------------------------------------------
router.route('/user').put(controller.updateUser)// pierde la ruta de las imagenes y no actualiza el usuario
// ----------------------------------------------
router.route('/photo').put(controller.updatePhoto)// doble no jala
router.route('/album').delete(controller.deleteAlbum)





module.exports = router