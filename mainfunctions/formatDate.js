// Input = 'YYYY-MM-DD' Output = 'DD Mon YYYY' 

module.exports = (dateString) => {
    // fda = formattedDateArray
    let fda = dateString.split('-');
    fda = swapELements(fda, 0, 2);
    const monthNr = parseInt(fda[1]);
    console.log(monthNr);
    fda[1] = returnMonthForNumber(monthNr);
    fda = fda.join(' ');
    return fda;
}

// swap the elements in arr for two index values. 
swapELements = (arr, i1, i2) => {
    // da = dateArray
    let da = arr;
    const tmp = da[i1];
    da[i1] = da[i2];
    da[i2] = tmp;
    return da;
}
returnMonthForNumber = (n) => {
    const num = n-1;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Okt','Nov','Dec'];
    return months[num];
}


