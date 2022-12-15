function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

$(async function () {
    let $time = $('#time');

    while (true) {
        let today = new Date();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        $time.html(time);
        await sleep(1000);
    }
});