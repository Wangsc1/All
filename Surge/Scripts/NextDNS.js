//Script event auto linked ipv4 nextdns: network-change

async function launch() {
    await linkedip();
}
launch()
function linkedip(){ 
$httpClient.post('https://link-ip.nextdns.io/94eed1/c71566235dccad8c', function(error, response, data){
  if (error) {
console.log('‼️');
  } else {
console.log('👌 '+ data);
  }
  $done();
});
}