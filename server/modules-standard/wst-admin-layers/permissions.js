global.objectGrants.push(
    {
      module:'Layers',
      label:'Layers',
      description:'Manage layers',
      type: 'app',
      permissions: [
              {
                  name:'see',
                  label: 'see',
                  description: 'Allow the user with this permission to see the list of layers of the company'
              },
              {
                  name:'create',
                  label: 'create',
                  description: 'Allow the user with this permission to create layers'
              },
              {
                  name:'update',
                  label: 'update',
                  description: 'Allow the user with this permission to update layers'
              },
              {
                  name:'delete',
                  label: 'delete',
                  description: 'Allow the user with this permission to delete layers'
              },
              {
                  name:'stats',
                  label: 'stats',
                  description: 'Allow the user with this permission see statistics of layers'
              }

          ]
    }
);
