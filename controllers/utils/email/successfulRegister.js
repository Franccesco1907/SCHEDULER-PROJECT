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
        defaultLayout: 'successful-register',
        partialsDir: 'views/email/',
    },
    viewPath: 'views/email',
    extName: '.hbs'
};

smtpTransport.use('compile', hbs(options));

module.exports.sendSetPasswordEmail = async (email, token) => {

    await smtpTransport.sendMail({
        from: "soporte.proyecto.app.sw",
        to: email,
        subject: "¡Bienvenido! - Sistema de Departamentos PUCP",
        attachments: [
            { filename: 'logo.png', path: dirProject + 'public/images/logo.png', cid: 'logo' },
            //{ filename: 'campus.jpg', path: dirProject + 'public/images/campus.jpg', cid: 'campus' }
        ],
        template: 'successful-register',
        context: {
            urlSetPassword: `${urlSoftware}user/set-password?token=${token}`,
            urlApp: urlSoftware
        }
    });
};

