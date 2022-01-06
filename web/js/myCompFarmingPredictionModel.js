
function AccountProfile(array){
    const obj = {};

    obj["suppliedAssets"] = SupplyAssetArray(array["suppliedAssets"]);
    obj["borrowedAssets"] = BorrowAssetArray(array["borrowedAssets"]);

    obj["totalSuppliedInUSD_"] = array["totalSuppliedInUSD_"];
    obj["totalBorrowedInUSD_"] = array["totalBorrowedInUSD_"];
    obj["accountCapital_"] = array["accountCapital_"];
    obj["totalSuppliedInUsdAsCollateral_"] = array["totalSuppliedInUsdAsCollateral_"];
    obj["borrowLimitPCTMantissa_"] = array["borrowLimitPCTMantissa_"];

    obj["borrowLimitPCTLineItemMantissaList"] = [];

    for(var i = 0; i < array["borrowLimitPCTLineItemMantissaList"].length; i++){
        obj["borrowLimitPCTLineItemMantissaList"].push(array["borrowLimitPCTLineItemMantissaList"][i]);
    }

    return obj;
}

function AccountProfile_obj2Array(obj){
    var objToConvert;
    for(var i = 0; i < obj.suppliedAssets.length; i++){
        objToConvert = obj.suppliedAssets[i].asset;
        obj.suppliedAssets[i].asset = Object.values(objToConvert);

        objToConvert = obj.suppliedAssets[i];
        obj.suppliedAssets[i] = Object.values(objToConvert);
    }

    for(var i = 0; i < obj.borrowedAssets.length; i++){
        objToConvert = obj.borrowedAssets[i].asset;
        obj.borrowedAssets[i].asset = Object.values(objToConvert);

        objToConvert = obj.borrowedAssets[i];
        obj.borrowedAssets[i] = Object.values(objToConvert);
    }

    return Object.values(obj);
}

function SupplyAssetArray(raw_array){
    const result_array = [];

    for(var i = 0; i < raw_array.length; i++){
        result_array.push(SupplyAsset(raw_array[i]));
    }

    return result_array;
}

function BorrowAssetArray(raw_array){
    const result_array = [];

    for(var i = 0; i < raw_array.length; i++){
        result_array.push(BorrowAsset(raw_array[i]));
    }

    return result_array;
}

function SupplyAsset(array){
    const obj = {};

    obj["asset"] = Asset(array["asset"]);
    obj["collateralFactorMantissa_"] = array["collateralFactorMantissa_"];
    obj["suppliedInUsdAsCollateral_"] = array["suppliedInUsdAsCollateral_"];

    return obj;
}

function BorrowAsset(array){
    const obj = {};

    obj["asset"] = Asset(array["asset"]);

    return obj;
}

function Asset(array){
    const obj = {};

    obj["cTokenAddr"] = array["cTokenAddr"];
    obj["amount"] = array["amount"];
    obj["underlyingSymbol_"] = array["underlyingSymbol_"];
    obj["underlyingDecimals_"] = array["underlyingDecimals_"];
    obj["valueInUSD_"] = array["valueInUSD_"];
    obj["compSupplySpeed_"] = array["compSupplySpeed_"];
    obj["compBorrowSpeed_"] = array["compBorrowSpeed_"];
    return obj;
}

function CTokenInterest(array){
    const obj = {};

    obj["cTokenAddr"] = array["cTokenAddr"];
    obj["interestRateMantissa"] = array["interestRateMantissa"];
    obj["balance"] = array["balance"];
    obj["underlyingSymbol_"] = array["underlyingSymbol_"];
    obj["interestInUSD_"] = array["interestInUSD_"];

    return obj;
}

function CTokenInterestArray(raw_array){
    const result_array = [];

    for(var i = 0; i < raw_array.length; i++){
        result_array.push(CTokenInterest(raw_array[i]));
    }

    return result_array;
}

function AccountInterestProfile(array){
    const obj = {};

    obj["supplyInterests"] = CTokenInterestArray(array["supplyInterests"]);
    obj["borrowInterests"] = CTokenInterestArray(array["borrowInterests"]);
    obj["totalInterestInUSD_"] = array["totalInterestInUSD_"];
    obj["isPositiveInterest_"] = array["isPositiveInterest_"];

    return obj;
}

export{
   AccountProfile,
   SupplyAssetArray,
   BorrowAssetArray,
   SupplyAsset,
   BorrowAsset,
   Asset,
   CTokenInterest,
   CTokenInterestArray,
   AccountInterestProfile,
   AccountProfile_obj2Array
}
