
function timestampToDateTimeLocal(timestamp){
     var date = new Date(timestamp * 1000);

     return date;
}


export{
    timestampToDateTimeLocal
}
