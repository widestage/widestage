global.objectGrants.push(
    {
      module:'Connections',
      label:'Connections',
      description:'Manage connections',
      type: 'app',
      permissions: [
              {
                  name:'see',
                  label: 'see',
                  description: 'Allow the user with this permission to see the list of connections of the company'
              },
              {
                  name:'create',
                  label: 'create',
                  description: 'Allow the user with this permission to create connections'
              },
              {
                  name:'update',
                  label: 'update',
                  description: 'Allow the user with this permission to update connections'
              },
              {
                  name:'delete',
                  label: 'delete',
                  description: 'Allow the user with this permission to delete connections'
              }

          ]
    }
);
