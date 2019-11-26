var mongoose = require('mongoose');

var UsersSchemaV3 = new mongoose.Schema({
    name: {type: String},
    code: {type: String},
    image: {type: String},
    email: {type: String},
    companyID: {type: String},
    sex: {type: String}, //Man or Woman
    status: {type: String}, //Active, Temporary Leave, Out of the Company for users auth is only relevant, Active / Not active
    language: {type: String},
    twitter: {type: String},
    facebook: {type: String},
    google: {type: Object},
    webSite: {type: String},
    salt: {type: String},
    hash: {type: String},
    provider: {type: String, default: 'local'},
    hash_verify_account: {type: String},
    hash_change_password: {type: String},
    change_password: {type: Boolean},
    roles: [],
    filters: [],
    accessToken: {type: String},
    last_login_date: {type: Date},
    last_login_ip: {type: String},
    created: {type: Date, default: Date.now},
    modified: {type: Date},
    startDate: {type: Date, default: Date.now},
    endDate: {type: Date},
    history: String,
    invitation_hash: {type: String},
    dismissHomePage: {type: Boolean, required: true, default: false},
    nd_trash_deleted: {type: Boolean, required: true, default: false}
}, { collection: 'wice_users' });


console.log('users model loaded');

global.registerDBModel('users');
var UsersV3 = connection.model('users', UsersSchemaV3);
module.exports = UsersV3;
global.Users = UsersV3;
