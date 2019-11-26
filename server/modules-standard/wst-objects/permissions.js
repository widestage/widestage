global.objectGrants.push(
    {
      module:'public-space-folders',
      label:'Public space folders',
      description:'Manage grants for public space folders',
      type: 'object',
      permissions: [
              {
                  name:'see',
                  label: 'see',
                  description: 'Allow the user with this permission to see and execute objects contained into this folder'
              },
              {
                  name:'publish',
                  label: 'publish',
                  description: 'Allow the user with this permission to publish objects into this folder'
              },
              {
                  name:'unpublish',
                  label: 'unpublish',
                  description: 'Allow the user with this permission to unpublish objects contained in this folder'
              },
              {
                  name:'createSubFolder',
                  label: 'create subfolder',
                  description: 'Allow the user with this permission to create subfolders in this folder'
              }

          ]
    }

);
