module.exports = function (app) {
	var Files = require('./controller.js');

	app.get('/api/files/get-files', restrict, Files.getFiles);
	app.get('/api/files/my-images', restrict, Files.getMyImages);
  app.post('/api/files/upload', restrict, Files.upload);
	app.post('/api/images/upload', restrict, Files.uploadCompanyImages);
	app.post('/api/images/user/upload', restrict, Files.uploadUserImages);
};
