const express  = require('express');
const router = new express.Router()

const controller = require('../controllers/controller')

router.route('/').get(controller.holaMundo)
router.route('/login').post(controller.login)
router.route('/user').get(controller.getUser)
router.route('/user').post(controller.addUser)
router.route('/user').put(controller.updateUser)
router.route('/photo').post(controller.uploadPhoto)
router.route('/photo').put(controller.updatePhoto)
router.route('/photo').delete(controller.deletePhoto)
router.route('/album').get(controller.getAlbum)
router.route('/album').delete(controller.deleteAlbum)



module.exports = router