module.exports = function (app) {

    console.log('Module statistics loaded');
    addModulesUsedList('statistics');
    require('./model.js');
}
