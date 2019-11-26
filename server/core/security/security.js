exports.secureApp = function(){
    secureApp();
};

module.exports = function (req, res, next) {
    // -> Disable X-Powered-By to prevent showing the header for atackers ( min security )
    app.disable('x-powered-by')
  
    // -> Disable Frame Embedding
    /*res.set('X-Frame-Options', 'deny')
  
    // -> Re-enable XSS Fitler if disabled
    res.set('X-XSS-Protection', '1; mode=block')
  
    // -> Disable MIME-sniffing
    res.set('X-Content-Type-Options', 'nosniff')
  
    // -> Disable IE Compatibility Mode
    res.set('X-UA-Compatible', 'IE=edge')
  
    // -> Disables referrer header when navigating to a different origin
    res.set('Referrer-Policy', 'same-origin')
  
    return next();*/
  }