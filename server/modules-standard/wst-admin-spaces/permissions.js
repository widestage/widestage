global.objectGrants.push(
    {
      module:'Spaces',
      label:'Public Space',
      description:'Manage public spaces',
      type: 'app',
      permissions: [
              {
                  name:'update',
                  label: 'update',
                  description: 'Allow the user with this permission to update the public spaces structure'
              }
          ]
    }
);
