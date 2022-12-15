module.exports = function (app) {
    /****************************** PORTAL WEB ********************************************/
    app.use('/', require('../controllers/app/main'));
    app.use('/user', require('../controllers/app/user'));
    app.use('/admin', require('../controllers/app/admin'));
    app.use('/section-assistant', require('../controllers/app/sectionAssistant'));
    app.use('/department-secretary', require('../controllers/app/departmentSecretary'));
    app.use('/department-assistant', require('../controllers/app/departmentAssistant'));
    app.use('/section-coordinator', require('../controllers/app/sectionCoordinator'));
    app.use('/any-user', require('../controllers/app/anyUser'));
    app.use('/guest', require('../controllers/app/guest'));
    app.use('/teacher', require('../controllers/app/teacher'));
    app.use('/investigation-assistant', require('../controllers/app/investigationAssistant'));
};