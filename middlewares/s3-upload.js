const { S3 } = require('@aws-sdk/client-s3');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { AUTO_CONTENT_TYPE } = require('multer-s3');
const { extname } = require('path');
const multerS3 = require('multer-s3');
const moment = require('moment');

const s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
});


const upload = multer({
      storage: multerS3({
            s3,
            bucket: process.env.AWS_BUCKET,
            contentType: AUTO_CONTENT_TYPE,
            // acl: 'public-read',
            key: (req, file, cb) => {
                  let filename = file.originalname && file.originalname.includes("-") ? file.originalname.split('-') : file.originalname;
                  if (filename && Array.isArray(filename)) {
                        filename = `${filename[0]}/${filename[1]}/${filename[2]}/${filename[filename.length - 1]}`
                  }
                  cb(null, `${filename}`);
            },
      }),
      fileFilter: function (req, file, cb) {
            const filetypes = /jpeg|webp|svg|jpg|png|tiff|gif|pdf/;
            const mimetype = filetypes.test(file.mimetype);
            const extName = filetypes.test(extname(file.originalname).toLowerCase());
            if (mimetype && extName) {
                  return cb(null, true);
            }

            cb(new Error('Only image and pdf files are allowed!'));
      },
});

const deleteS3Object = async (key) => {
      if (!key) {
            return "key is mandatory!!"
      }
      const params = {
            Bucket: process.env.AWS_BUCKET,
            Key: key
      };

      s3.deleteObject(params, function (err, data) {
            if (err) console.error(err, err.stack);
            else console.log(data);
      });

}

module.exports = {
      upload,
      deleteS3Object
}