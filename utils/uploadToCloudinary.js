const cloudinary = require('../config/cloudinary')
const streamifier = require('streamifier')

exports.uploadToCloudinary = (buffer, folder = 'general') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder,  },
      (error, result) => {
        if(result) resolve(result);
        else reject (error)
      }
    );
    streamifier.createReadStream(buffer).pipe(stream)
  })
}


// exports.uploadToCloudinary = (buffer, folder = "general") => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       { folder },
//       (error, result) => {
//         if (error) return reject(error);
//         if (!result) return reject(new Error("No result from Cloudinary"));
//         resolve(result);
//       }
//     );

//     const uploadStream = streamifier.createReadStream(buffer);

//     uploadStream.on("error", (err) => {
//       reject(err);
//     });

//     stream.on("error", (err) => {
//       reject(err);
//     });

//     uploadStream.pipe(stream);
//   });
// };