const superagent = require("superagent");
const baseUrl = 'http://34.107.140.235/';

async function getData(url = "", jwt = '') {
  return await superagent
    .get(baseUrl + url)
    .set('Authorization', `Bearer ${jwt}`)
    .then((res) => {
      return res.body;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
}

async function postData(url = "", body = {}, jwt = '') {
  return await superagent
    .post(baseUrl + url)
    .send(body)
    .set("Accept", "application/json")
    .set("Content-Type", "application/json")
    .set('Authorization', `Bearer ${jwt}`)
    .then((res) => {
      return res.body;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
}

async function deleteData(url = "", jwt = '') {
  return await superagent
    .delete(baseUrl + url)
    .set('Authorization', `Bearer ${jwt}`)
    .then((res) => {
      return res.body;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
}

async function putData(url = "", body = {}, jwt = '') {
  return await superagent
    .put(baseUrl + url)
    .send(body)
    .set('Authorization', `Bearer ${jwt}`)
    .then((res) => {
      return res.body;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
}

module.exports = { getData, postData, deleteData, putData };
