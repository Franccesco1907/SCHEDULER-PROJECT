const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const { getDirectoryProject } = require('../getDirectoryProject');
const { urlSoftware } = require('../../../config/url');
const dirProject = getDirectoryProject(__dirname, 3);

var smtpTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: "soporte.proyecto.app.sw@gmail.com",
        pass: "HHRn$A!1U$IJwKQdQWB*",
    },
});

var options = {
    viewEngine: {
        extname: '.hbs',
        layoutsDir: 'views/email/',
        defaultLayout: 'successful-request',
        partialsDir: 'views/email/',
    },
    viewPath: 'views/email',
    extName: '.hbs'
};

smtpTransport.use('compile', hbs(options));

module.exports.sendSuccessfulRequest = async (email, name, departament, requestCode) => {

    await smtpTransport.sendMail({
        from: "soporte.proyecto.app.sw",
        to: email,
        subject: "¡Trámite Enviado! - Sistema de Departamentos PUCP",
        attachments: [
            { filename: 'logo.png', path: dirProject + 'public/images/logo.png', cid: 'logo' },
            //{ filename: 'campus.jpg', path: dirProject + 'public/images/campus.jpg', cid: 'campus' }
        ],
        template: 'successful-request',
        context: {
            name,
            departament,
            urlRequest: `${urlSoftware}guest/view-request?requestCode=${requestCode}&email=${email}`,
            requestCode,
            urlApp: urlSoftware + 'guest'
        }
    });
};

