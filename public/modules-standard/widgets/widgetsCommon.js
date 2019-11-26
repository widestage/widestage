app.service('widgetsCommon' , function () {

    this.textAlign = [
        {name: 'left', value: 'left'},
        {name: 'right', value: 'right'},
        {name: 'center', value: 'center'}
    ];

    this.fontSizes = [
        {name: '8px', value: '8px'},
        {name: '9px', value: '9px'},
        {name: '10px', value: '10px'},
        {name: '11px', value: '11px'},
        {name: '12px', value: '12px'},
        {name: '13px', value: '13px'},
        {name: '14px', value: '14px'},
        {name: '15px', value: '15px'},
        {name: '16px', value: '16px'},
        {name: '17px', value: '17px'},
        {name: '18px', value: '18px'},
        {name: '19px', value: '19px'},
        {name: '20px', value: '20px'}
    ];

    this.fontWeights = [
        {name: 'normal', value: 'normal'},
        {name: 'bold', value: 'bold'},
        {name: 'bolder', value: 'bolder'},
        {name: 'lighter', value: 'lighter'},
        {name: '100', value: '100'},
        {name: '200', value: '200'},
        {name: '300', value: '300'},
        {name: '400', value: '400'},
        {name: '500', value: '500'},
        {name: '600', value: '600'},
        {name: '700', value: '700'},
        {name: '800', value: '800'},
        {name: '900', value: '900'}
    ];

    this.fontStyles = [
        {name: 'normal', value: 'normal'},
        {name: 'italic', value: 'italic'},
        {name: 'oblique', value: 'oblique'}
    ];

    this.signalOptions = [
        {value:"equal",label:"equal"},
        {value:"diferentThan",label:"different than"},
        {value:"biggerThan",label:"bigger than"},
        {value:"biggerOrEqualThan",label:"bigger or equal than"},
        {value:"lessThan",label:"less than"},
        {value:"lessOrEqualThan",label:"less or equal than"},
        {value:"between",label:"between"},
        {value:"notBetween",label:"not between"}
    ];

    this.textAligns = [
        {name: 'center', value: 'center'},
        {name: 'end', value: 'end'},
        {name: 'inherit', value: 'inherit'},
        {name: 'initial', value: 'initial'},
        {name: 'justify', value: 'justify'},
        {name: 'left', value: 'left'},
        {name: 'right', value: 'right'},
        {name: 'start', value: 'start'},
        {name: 'unset', value: 'unset'}
    ];

});
