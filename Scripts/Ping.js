//由本群重庆佬提供，key和小白脸大佬修改完善。
let $ = {
Baidu:'https://www.baidu.com',
Google:'https://www.google.com/generate_204',
Github:'https://www.github.com'
}

!(async () => {
await Promise.all([http('Baidu'),http('Github'),http('Google')]).then((x)=>{
	$done({
    title: 'Ping Test',
    content: x.join('\n'),
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
						'\xa0\xa0\xa0\t: ' +
						(Date.now() - time)+' ms');
        });
    });
}