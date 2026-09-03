const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadDir = 'uploads/'
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir)
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    },
})

const upload = multer({ 
    storage,

    fileFilter: function (req, file, cb) {
        if(!file.mimetype.startsWith('image/')) {
            return cb(new Error('Apenas imagens são permitidas!'), false)
        }
        cb(null, true)
    },
    limits: {fileSize: 10 * 1024 * 1024}
 })

module.exports = upload