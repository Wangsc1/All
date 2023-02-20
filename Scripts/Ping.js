// https://raw.githubusercontent.com/getsomecat/GetSomeCats/Surge/script/ConnectivityTest.js

let $ = {
Baidu:'https://www.baidu.com',
Google:'https://www.google.com/generate_204'
}

!(async () => {
await Promise.all([http('Baidu'),http('Google')]).then((x)=>{
	$done({
    title: 'Ping Test',
    content: x.join(' | '),
    icon: 'bolt.horizontal.circle.fill',
    'icon-color': '#2B2D40',
  })
})
})();

function http(req) {
    return new Promise((r) => {
			let time = Date.now();
        $httpClient.post($[req], (err, resp, data) => {
            r(req +
						': ' +
						(Date.now() - time)+'ms');
        });
    });
}