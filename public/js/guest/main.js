import { showNotification } from '/utils/notifications.js';

var $request_code = $('#request-code');
var $email = $('#email');

$(function () {
    $('#consult-request').on('click', function () {
        if ($request_code.val() === '') {
            showNotification('alert-warning', `Ingrese el código de su trámite <i class="fas fa-exclamation pl-2"></i>`);
            $request_code.addClass('is-invalid');
            setTimeout(() => {
                $request_code.removeClass('is-invalid');
            }, 2000);
        } else if ($email.val() === '') {
            showNotification('alert-warning', `Ingrese su correo electrónico <i class="fas fa-exclamation pl-2"></i>`);
            $requeemailst_code.addClass('is-invalid');
            setTimeout(() => {
                $email.removeClass('is-invalid');
            }, 2000);
        } else {
            window.location.replace(`/guest/view-request?requestCode=${$request_code.val()}&email=${$email.val()}`);
        }
    });
});
