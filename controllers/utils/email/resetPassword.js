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
        defaultLayout: 'reset-password',
        partialsDir: 'views/email/',
    },
    viewPath: 'views/email',
    extName: '.hbs'
};

smtpTransport.use('compile', hbs(options));

module.exports.sendResetPasswordEmail = async (email, token) => {

    await smtpTransport.sendMail({
        from: "soporte.proyecto.app.sw",
        to: email,
        subject: 'Sistema de Departamentos PUCP - ¿Olvidaste tu contraseña?',
        attachments: [
            { filename: 'logo.png', path: dirProject + 'public/images/logo.png', cid: 'logo' },
            //{ filename: 'campus.jpg', path: dirProject + 'public/images/campus.jpg', cid: 'campus' }
        ],
        template: 'reset-password',
        context: {
            urlSetPassword: `${urlSoftware}user/set-password?token=${token}`,
            urlApp: urlSoftware
        }
    });
};

