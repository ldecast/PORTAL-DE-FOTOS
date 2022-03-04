const express  = require('express');
const router = new express.Router()
const controller = require('../controllers/controller')
const midelWare = require('../services/midelwate')

router.get('/',midelWare.verify,controller.holaMundo)
router.post('/login',controller.login)
router.get('/user',midelWare.verify,controller.getUser)
router.post('/user',controller.addUser)
router.post('/photo',midelWare.verify,controller.uploadPhoto)
router.delete('/photo',midelWare.verify,controller.deletePhoto)
router.put('/user',midelWare.verify,controller.updateUser)
//-----------------------------------------
router.put('/photo',midelWare.verify,controller.updatePhotoFix)
//---------------------------------------------
router.route('/album').get(controller.getAlbum)
router.route('/album').delete(controller.deleteAlbum)
//router.route('/photo2').put(controller.updatePhoto)
//router.delete('/user',midelWare.verify,controller.deleteUser)





module.exports = router