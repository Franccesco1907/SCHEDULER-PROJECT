const baseUrl = 'http://34.107.140.235/';
//const baseUrl = 'http://localhost/';

export async function getData(url = '', jwt = '') {
    let response;
    await fetch(baseUrl + url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${jwt}`,
        },
    })
        .then(res => res.json())
        .then(data => {
            response = data;
        })
        .catch(error => {
            response = false;
            console.log(error);
        });
    return response;
}

export async function postData(url = '', data = {}, jwt = '', user = {}) {
    let response;

    data.auditoria = {
        usuario: user.correo,
        rol: user.rol,
        seccion: user.seccion,
        departamento: user.departamento
    };

    await fetch(baseUrl + url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(data => {
            response = data;
        })
        .catch(error => {
            response = false;
            console.log(error);
        });
    return response;
}
export async function putData(url = '', data = {}, jwt = '', user = {}) {
    let response;

    data.auditoria = {
        usuario: user.correo,
        rol: user.rol,
        seccion: user.seccion,
        departamento: user.departamento
    };

    await fetch(baseUrl + url, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(data => {
            response = data;
        })
        .catch(error => {
            response = false;
            console.log(error);
        });
    return response;
}



export async function deleteData(url = '', jwt = '') {
    let response;
    await fetch(baseUrl + url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
    })
        .then(res => res.json())
        .then(data => {
            response = data;
        })
        .catch(error => {
            response = false;
            console.log(error);
        });
    return response;
}