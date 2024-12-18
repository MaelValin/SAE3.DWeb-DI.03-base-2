

let data = await fetch("./src/data/json/lycees.json");
data = await data.json();
data.shift();


let Lycees = {}

Lycees.getAll = function(){ 
    return data;
}
/*
Lycees.binarysearch = function(numero_uai){
    let min=0;
    let max=data.length-1;
    let guess;
    while(min<=max){
        guess=Math.floor((min+max)/2);
        if(data[guess].numero_uai==numero_uai){
            return data[guess];
        }
        else if(data[guess].numero_uai<numero_uai){
            min=guess+1;
        }
        else{
            max=guess-1;
        }
    }
    return null;
}*/


Lycees.getAllValid = function() {
    return data.filter(lycee => lycee.latitude !== '' && lycee.longitude !== '');
}

export { Lycees };