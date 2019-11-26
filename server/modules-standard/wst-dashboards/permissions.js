global.objectGrants.push(
    {
      module:'Dashboards',
      label:'Dashboards',
      description:'Manage dashboards',
      type: 'app',
      permissions: [
              {
                  name:'see',
                  label: 'see',
                  description: 'Allow the user with this permission to see the list of dashboards of the company'
              },
              {
                  name:'create',
                  label: 'create',
                  description: 'Allow the user with this dashboards to create reports'
              },
              {
                  name:'update',
                  label: 'update',
                  description: 'Allow the user with this dashboards to update reports'
              },
              {
                  name:'delete',
                  label: 'delete',
                  description: 'Allow the user with this dashboards to delete reports'
              }

          ]
    }
);
