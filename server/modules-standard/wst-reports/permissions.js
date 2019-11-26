global.objectGrants.push(
    {
      module:'Reports',
      label:'Reports',
      description:'Manage reports',
      type: 'app',
      permissions: [
              {
                  name:'see',
                  label: 'see',
                  description: 'Allow the user with this permission to see the list of reports of the company'
              },
              {
                  name:'create',
                  label: 'create',
                  description: 'Allow the user with this permission to create reports'
              },
              {
                  name:'update',
                  label: 'update',
                  description: 'Allow the user with this permission to update reports'
              },
              {
                  name:'delete',
                  label: 'delete',
                  description: 'Allow the user with this permission to delete reports'
              }

          ]
    }
);


global.objectGrants.push(
    {
      module:'Explorer',
      label:'Explorer',
      description:'Build queries and explore data',
      type: 'app',
      permissions: [
              {
                  name:'access',
                  label: 'Access',
                  description: 'Allow the user with this permission to access the data explorer'
              },
              {
                  name:'seeSQL',
                  label: 'see generated SQL',
                  description: 'Allow the user with this permission to see the generated sql for a given query'
              }

          ]
    }
);
