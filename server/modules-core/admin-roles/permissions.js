global.objectGrants.push(
    {
      module:'roles',
      label:'Roles',
      description:'Manage roles',
      type: 'app',
      permissions: [
              {
                  name:'see',
                  label: 'see',
                  description: 'Allow the user with this permission to see the list of roles of the company'
              },
              {
                  name:'create',
                  label: 'create',
                  description: 'Allow the user with this permission to create roles'
              },
              {
                  name:'update',
                  label: 'update',
                  description: 'Allow the user with this permission to update roles'
              },
              {
                  name:'delete',
                  label: 'delete',
                  description: 'Allow the user with this permission to delete roles'
              }

          ]
    }
);
