app.config(function($stateProvider) {

      $stateProvider.state('/admin/email/templates', {
          url: '/admin/email/templates',
          templateUrl: '/admin-email-templates/views/index.html',
          controller: 'adminEmailTemplatesCtrl',
          resolve: {
              loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                                              '/admin-email-templates/directives/emailTemplateForm.js',
                                              '/admin-email-templates/controllers/admin-email-templates.js'
                                          ],{serie:true});


              }]
          }
      });

});
