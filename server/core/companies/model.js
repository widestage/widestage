var mongoose = require('mongoose');
var nd_historyCompaniesSchema = new mongoose.Schema({
    text: String,
    user_id: String,
    user_name: String,
    user_companyID: String,
    user_companyName: String,
    created: { type: Date, default: Date.now }
});

var developmentCycleHistory = new mongoose.Schema({
    cycle: {type: Number, required: true},
    startDate: {type: Date, default: Date.now },
    endDate: {type: Date}
});

var valuesCatalog = new mongoose.Schema({
    field: {type: String, required: true},
    values: {type: Array}
});



var CompaniesSchema = new mongoose.Schema({
    status: {type: Number, required: true},
    companyCode: {type: String},
    companyName: {type: String, required: true},
    companyURL: {type: String, required: true},
    companySuffix: {type: String},
    legalInfo: {
            taxNumber: {type: Number},
            companyAddress: {type: String},
            country:  {type: String},
            stateOrProvince:  {type: String},
            postalCode: {type: String}
    },
    licenseInfo: {
        companyPlan: {type: Number, required: true, default: 0}, //0 - Open Source, 1 - Referal, 2 - Standard, 3 - Enterprise, 4 - Custom
        numberOfUsers: {type: Number},
        usersLimit: {type: Number, required: true, default: 50},
        modules: {},  //all installed modules in the license, like external data perspectives, matrix evaluation, etc...
        licensePackets:{}, //same as modules but by group of modules
        maxAdministrators: {type: Number}
    },
    modulesProperties: {}, //properties for every installed module in the application
    customization: {
        defaultInitPage: {type: String},
        login: {
            backgroundImage: {type: String},
            backgroundColor: {type: String},
            backgroundType: {type: String},
            customCSS: {type: String}
        },
        customCSS: {type: String},
        logo: {type: String},
        mainColor: {type: String},
        backgroundImage: {type: String},
        workweekConfiguration: {
                    monday: {type: Boolean},
                    tuesday: {type: Boolean},
                    wednesday: {type: Boolean},
                    thursday: {type: Boolean},
                    friday: {type: Boolean},
                    saturday: {type: Boolean},
                    sunday: {type: Boolean}
        },
        defaultLanguage: {type: String},
        theme: {type: String}
    },
    signUpDate: { type: Date, default: Date.now },
    signUpVisitorID: {type: String},
    signUpIP: {type: String},
    configuration: {type: Object},
    billing: {
        contacts: [{
                    name: {type: String},
                    email: {type: String},
                    phone: {type: String},
                    position: {type: String},
                    department: {type: String}
            }],
        billingCycle:{type: Number}, //month, year
        billingType: {type: String}, //user, fix
        billingAmmount: {type: Number}, //ammount per user or fixed
        taxName1: {type: String},
        taxName2: {type: String},
        tax1Percent: {type: Number},
        tax2Percent: {type: Number},
        sameAddressAsCompanyAddress : {type: Boolean},
        address: {
            address: {type: String},
            city: {type: String},
            state: {type: String},
            country: {type: String},
            postalCode: {type: String},
        }

    },
    history: [nd_historyCompaniesSchema],
    createdBy: {type: String},
    startDate: {type: Date, default: Date.now },
    endDate: {type: Date},
    created: {type: Date, default: Date.now},
    modified: {type: Date}
}, { collection: 'wice_Companies' });

global.registerDBModel('Companies');
var Companies = connection.model('Companies', CompaniesSchema);
module.exports = Companies;
