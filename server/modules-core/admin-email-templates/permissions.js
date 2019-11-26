global.objectGrants.push(
    {
      module:'email-templates',
      label:'Email templates',
      description:'Manage templates used for emails',
      type: 'app',
      permissions: [
              {
                  name:'see',
                  label: 'see',
                  description: 'Allow the user with this permission to see the list of email templates of the company'
              },
              {
                  name:'create',
                  label: 'create',
                  description: 'Allow the user with this permission to create email templates'
              },
              {
                  name:'update',
                  label: 'update',
                  description: 'Allow the user with this permission to update email templates'
              },
              {
                  name:'delete',
                  label: 'delete',
                  description: 'Allow the user with this permission to delete email templates'
              }

          ]
    }
);
