global.objectGrants.push(
    {
      module:'users',
      label:'Users',
      description:'Manage users',
      type: 'app',
      permissions: [
              {
                  name:'see',
                  label: 'see',
                  description: 'Allow the user with this permission to see the list of users of the company'
              },
              {
                  name:'create',
                  label: 'create',
                  description: 'Allow the user with this permission to create users'
              },
              {
                  name:'update',
                  label: 'update',
                  description: 'Allow the user with this permission to update users'
              },
              {
                  name:'delete',
                  label: 'delete',
                  description: 'Allow the user with this permission to delete users'
              }

          ]
    }
);
