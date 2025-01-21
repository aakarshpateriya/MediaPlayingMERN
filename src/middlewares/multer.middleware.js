import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname) // file.originalname is the name of the file that is uploaded. this will be for some time only go to 7 : 39
    }
  })
  
  export const upload = multer({
     storage,
     })