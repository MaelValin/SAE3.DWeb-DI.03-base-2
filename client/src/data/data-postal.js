

let data = await fetch("./src/data/json/postal.json");
data = await data.json();



let Postal = {}

Postal.getAll = function(){ 
    return data;
}
Postal.getByPostalCode = function($postal) {
    return data.filter(item => item.code_postal == `${$postal}000`);
   
}



export { Postal };