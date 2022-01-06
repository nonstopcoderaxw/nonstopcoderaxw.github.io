import * as Model from "./myCompFarmingPredictionModel.js";

const constants_urls = {
    etherscan: "https://etherscan.io/address/"
}

const addresses = {
    CompFarmingSummaryV3: (() => {
        const v = findGetParameter("contract");
        if(v) return v;

        return "1";
    })()
    // "0xfaAddC93baf78e89DCf37bA67943E1bE8F37Bb8c" // V4
    // //"0xc1b7f22d0bc15edfed4fccde5dcdd3ceefa9717a" V3 in mainnet
}

const targetedBorrowLimitPCT = (() => {
    const v = findGetParameter("max_borrow_limit");
    if(v) return v;

    return "1";
})();

const web3 = new Web3(window.ethereum);

const abis = {
    CompFarmingSummaryV3: null
}

const contracts = {
    CompFarmingSummaryV3: null
};

const data_comp_profile = {};

const accountProfileObj = {
    interest: {
        weekly: null,
        monthly: null,
        quarterly: null,
        yearly: null
    },
    comp: {
        weekly: null,
        monthly: null,
        quarterly: null,
        yearly: null

    },
    total: {
        weekly: null,
        monthly: null,
        quarterly: null,
        yearly: null

    },
    borrowLimit: null
}

const allocationObj = {
    symbol: null,
    supplied:{
      amount: null,
      value: null
    },
    borrowed:{
      amount: null,
      value: null
    }
}

const numberOfBlocks = {
    week: 45206,
    month: 193740,
    quarter: 581220,
    year: 2357170
}

var account;
var compPriceInUSD;
var currentAccountProfile = clone(accountProfileObj);
var currentAllocation = [];
var currentAPY;
var currentLiquidationRisk;

var maxFarmingAccountProfile = clone(accountProfileObj);
var maxFarmingAllocation = [];
var maxFarmingAPY;
var maxFarmingLiquidationRisk;

var maxInterestAccountProfile = clone(accountProfileObj);
var maxInterestAllocation = [];
var maxInterestAPY;
var maxInterestLiquidationRisk;


main();

async function main(){
    await loadABI();
    initEthereum();
    initChartJS();
    await initContracts();
    await pageOnLoad();
    await retStats();
    UIDisplayData();

}

async function loadABI(){
    var compFarmingSummaryV3_JSON = await $.getJSON("./contracts/CompFarmingSummaryV3.json");
    abis["CompFarmingSummaryV3"] = compFarmingSummaryV3_JSON;
}

async function connectToMetaMask(){

    try{
        await window.ethereum.enable();
        var _accounts = await web3.eth.getAccounts();
        console.log("Connected to this account: ", _accounts);

        //refresh the page - change the account
        changeOfAccount(_accounts);


    }catch(e){
        console.log("connection failed!");
    }
}

async function changeOfAccount(newAccount){
    //update url
    window.location.href = "#" + newAccount;
    window.location.reload();

}

async function UIDisplayData(){

    var data = {
        title: "Yield Forecast",
        data: currentAccountProfile
    }
    const currentProfileHTML = await createHBhtml(data, "./hbs/HB_EarningTable.html");
    $("#currentProfile").html(currentProfileHTML);
    $("#current_borrowLimit").html(currentAccountProfile.borrowLimit);

    data = {
        data: currentAllocation
    }
    const currentAllocationHTML = await createHBhtml(data, "./hbs/HB_allocTable.html");
    $("#currentAllocation").html(currentAllocationHTML);
    $("#currentAPY").html(currentAPY);
    $("#currentLiquidationRisk").html(currentLiquidationRisk);

    createCOMPProfileChart();
    $("#compPriceInUSD").html(`$${compPriceInUSD}`);

    if(currentLiquidationRisk == "Asset Price Movement"){
        $("#maxFarmingSection").hide();
        $("#maxInterestSection").hide();
        $("#message").show();
        return;
    }

    data = {
        title: "Yield Forecast",
        data: maxFarmingAccountProfile
    }
    const maxFarmingAccountProfileHTML = await createHBhtml(data, "./hbs/HB_EarningTable.html");
    $("#maxFarmingAccountProfile").html(maxFarmingAccountProfileHTML);
    $("#farming_borrowLimit").html(maxFarmingAccountProfile.borrowLimit);

    data = {
        data: maxFarmingAllocation
    }
    const maxFarmingAllocationHtml = await createHBhtml(data, "./hbs/HB_allocTable.html");
    $("#maxFarmingAllocation").html(maxFarmingAllocationHtml);
    $("#maxFarmingAPY").html(maxFarmingAPY);
    $("#maxFarmingLiquidationRisk").html(maxFarmingLiquidationRisk);

    data = {
        data: maxInterestAllocation
    }

    const maxInterestAllocationHTML = await createHBhtml(data, "./hbs/HB_allocTable.html");
    $("#maxInterestAllocation").html(maxInterestAllocationHTML);

    data = {
        title: "Yield Forecast",
        data: maxInterestAccountProfile
    }

    const maxInterestAccountProfileHTML = await createHBhtml(data, "./hbs/HB_EarningTable.html");
    $("#maxInterestAccountProfile").html(maxInterestAccountProfileHTML);
    $("#maxInterest_borrowLimit").html(maxInterestAccountProfile.borrowLimit);
    $("#maxInterestAPY").html(maxInterestAPY);
    $("#maxInterestLiquidationRisk").html(maxInterestLiquidationRisk);



}

async function retStats(){
    compPriceInUSD = await (async () => {
        const v = findGetParameter("comp_price_usd");
        if(v) return v;

        return await getCompPriceInUSD();
    })();

    //load current account profile
    const accountProfileResultRaw = await getAccountProfile(account);
    const accountProfileWrapped = Model.AccountProfile(accountProfileResultRaw);
    //load current interest profile
    const interest_weekly = await getAccountInterestProfile(numberOfBlocks.week);
    const interest_monthly = await getAccountInterestProfile(numberOfBlocks.month);
    const interest_quarterly = await getAccountInterestProfile(numberOfBlocks.quarter);
    const interest_yearly = await getAccountInterestProfile(numberOfBlocks.year);
    //load current comp recievable
    const comp_weekly = await getTotalCompReceivable(numberOfBlocks.week);
    const comp_monthly = await getTotalCompReceivable(numberOfBlocks.month);
    const comp_quarterly = await getTotalCompReceivable(numberOfBlocks.quarter);
    const comp_yearly = await getTotalCompReceivable(numberOfBlocks.year);

    const compInUSD_weekly = (compPriceInUSD * comp_weekly).toFixed(2);
    const compInUSD_monthly = (compPriceInUSD * comp_monthly).toFixed(2);
    const compInUSD_quarterly = (compPriceInUSD * comp_quarterly).toFixed(2);
    const compInUSD_yearly = (compPriceInUSD * comp_yearly).toFixed(2);

    const borrowLimit = (accountProfileResultRaw.borrowLimitPCTMantissa_ / 10**18 * 100).toFixed(2);

    currentAccountProfile.interest = {
        weekly: interest_weekly,
        monthly: interest_monthly,
        quarterly: interest_quarterly,
        yearly: interest_yearly
    }

    currentAccountProfile.comp = {
        weekly: {amount:comp_weekly, value:compInUSD_weekly},
        monthly: {amount:comp_monthly, value:compInUSD_monthly},
        quarterly: {amount:comp_quarterly, value:compInUSD_quarterly},
        yearly: {amount:comp_yearly, value:compInUSD_yearly}
    }

    currentAccountProfile.total = {
        weekly: (parseFloat(currentAccountProfile.comp.weekly.value) + parseFloat(currentAccountProfile.interest.weekly)).toFixed(2),
        monthly: (parseFloat(currentAccountProfile.comp.monthly.value) + parseFloat(currentAccountProfile.interest.monthly)).toFixed(2),
        quarterly: (parseFloat(currentAccountProfile.comp.quarterly.value) + parseFloat(currentAccountProfile.interest.quarterly)).toFixed(2),
        yearly: (parseFloat(currentAccountProfile.comp.yearly.value) + parseFloat(currentAccountProfile.interest.yearly)).toFixed(2)
    }

    currentAccountProfile.borrowLimit = borrowLimit;
    currentAPY = calAPY(parseInt(accountProfileWrapped.accountCapital_)/10**18, parseInt(currentAccountProfile.total.yearly));
    //pop currentAllocation
    currentAllocation = accountProfileToAllocationObjArray(accountProfileWrapped);
    currentLiquidationRisk = await getLiquidationRiskRankingByAP(accountProfileWrapped);

    await retCompProfile();

    if(currentLiquidationRisk == "Asset Price Movement"){
        return;
    }

    //pop maxFarmingAccountProfile
    const farmingAccountProfileResultRaw = await getFarmingAccountProfile(accountProfileWrapped);
    const farmingAccountProfileWrapped = Model.AccountProfile(farmingAccountProfileResultRaw);
    const farmingAccountProfileAsInput = rawStructReturnToInput(farmingAccountProfileResultRaw);

    maxFarmingAccountProfile = await accountProfileToAccountProfileObj(farmingAccountProfileResultRaw, maxFarmingAccountProfile);

    // pop maxFarmingAllocation
    maxFarmingAllocation = accountProfileToAllocationObjArray(farmingAccountProfileWrapped);
    maxFarmingAPY = calAPY(parseInt(farmingAccountProfileWrapped.accountCapital_)/10**18, parseInt(maxFarmingAccountProfile.total.yearly));
    maxFarmingLiquidationRisk = await getLiquidationRiskRankingByAP(farmingAccountProfileWrapped);

    // pop maxInterestAccountProfile
    const maxInterestAccountProfileResultRaw = await getMaxInterestAccountProfileByAP(accountProfileWrapped);
    const maxInterestAccountProfileWrapped = Model.AccountProfile(maxInterestAccountProfileResultRaw);
    // pop maxInterestAllocation
    maxInterestAllocation = accountProfileToAllocationObjArray(maxInterestAccountProfileWrapped);
    // pop maxInterestAccountProfile
    maxInterestAccountProfile = await accountProfileToAccountProfileObj(maxInterestAccountProfileResultRaw, maxInterestAccountProfile);

    maxInterestAPY = calAPY(parseInt(maxInterestAccountProfileWrapped.accountCapital_)/10**18, parseInt(maxInterestAccountProfile.total.yearly));

    maxInterestLiquidationRisk = await getLiquidationRiskRankingByAP(maxInterestAccountProfileWrapped);

    //comp profile

}

async function accountProfileToAccountProfileObj(accountProfileResultRaw, accountProfileObj){

      //load farming profile
      const accountProfileAsInput = rawStructReturnToInput(accountProfileResultRaw);

      //load farming profile interest
      const accountInterest_weekly = await getAccountInterestProfileByAP(accountProfileAsInput, numberOfBlocks.week);
      const accountInterest_monthly = await getAccountInterestProfileByAP(accountProfileAsInput, numberOfBlocks.month);
      const accountInterest_quarter = await getAccountInterestProfileByAP(accountProfileAsInput, numberOfBlocks.quarter);
      const accountInterest_year = await getAccountInterestProfileByAP(accountProfileAsInput, numberOfBlocks.year);
      //load farming profile comp recievable
      const accountCompRecievable_weekly = await getTotalCompReceivablByAP(accountProfileAsInput, numberOfBlocks.week);
      const accountCompRecievable_monthly = await getTotalCompReceivablByAP(accountProfileAsInput, numberOfBlocks.month);
      const accountCompRecievable_quarterly = await getTotalCompReceivablByAP(accountProfileAsInput, numberOfBlocks.quarter);
      const accountCompRecievable_yearly = await getTotalCompReceivablByAP(accountProfileAsInput, numberOfBlocks.year);

      const accountCompValue_weekly = (accountCompRecievable_weekly * compPriceInUSD).toFixed(2);
      const accountCompValue_monthly = (accountCompRecievable_monthly * compPriceInUSD).toFixed(2);
      const accountCompValue_quarterly = (accountCompRecievable_quarterly * compPriceInUSD).toFixed(2);
      const accountCompValue_yearly = (accountCompRecievable_yearly * compPriceInUSD).toFixed(2);

      const accountBorrowLimit = (accountProfileResultRaw.borrowLimitPCTMantissa_ / 10**18 * 100).toFixed(2);

      accountProfileObj.interest = {
          weekly: accountInterest_weekly,
          monthly: accountInterest_monthly,
          quarterly: accountInterest_quarter,
          yearly: accountInterest_year

      }

      accountProfileObj.comp = {
          weekly: {amount:accountCompRecievable_weekly, value:accountCompValue_weekly},
          monthly: {amount:accountCompRecievable_monthly, value:accountCompValue_monthly},
          quarterly: {amount:accountCompRecievable_quarterly, value:accountCompValue_quarterly},
          yearly: {amount:accountCompRecievable_yearly, value:accountCompValue_yearly}
      }

      accountProfileObj.total = {
          weekly: (parseFloat(accountProfileObj.comp.weekly.value) + parseFloat(accountProfileObj.interest.weekly)).toFixed(2),
          monthly: (parseFloat(accountProfileObj.comp.monthly.value) + parseFloat(accountProfileObj.interest.monthly)).toFixed(2),
          quarterly: (parseFloat(accountProfileObj.comp.quarterly.value) + parseFloat(accountProfileObj.interest.quarterly)).toFixed(2),
          yearly: (parseFloat(accountProfileObj.comp.yearly.value) + parseFloat(accountProfileObj.interest.yearly)).toFixed(2)
      }

      accountProfileObj.borrowLimit = accountBorrowLimit;

      return accountProfileObj;
}

function calAPY(accountCapital, totalYield){
    return ((totalYield / accountCapital) * 100).toFixed(2);
}

function accountProfileToAllocationObjArray(_accountProfile){

    const suppliedAssets = _accountProfile.suppliedAssets;
    const borrowedAssets = _accountProfile.borrowedAssets;

    const allocationObjArray = [];

    for(var i = 0; i < suppliedAssets.length; i++){
        const allocation = clone(allocationObj);

        const supplied_item = suppliedAssets[i];
        const cTokenAddr = supplied_item.asset.cTokenAddr;

        allocation.symbol = supplied_item.asset.underlyingSymbol_;
        allocation.supplied.amount = (supplied_item.asset.amount / 10**supplied_item.asset.underlyingDecimals_).toFixed(2);
        allocation.supplied.value = (supplied_item.asset.valueInUSD_ / 10**18).toFixed(2);
        allocation.borrowed.amount = 0;
        allocation.borrowed.value = 0;
        for(var j = 0; j < borrowedAssets.length; j++){
            const borrowed_item = borrowedAssets[j];
            if(!isSameAddress(supplied_item.asset.cTokenAddr,borrowed_item.asset.cTokenAddr)) continue;

            allocation.borrowed.amount = (borrowed_item.asset.amount / 10**borrowed_item.asset.underlyingDecimals_).toFixed(2);
            allocation.borrowed.value = (borrowed_item.asset.valueInUSD_ / 10**18).toFixed(2);

        }

        allocationObjArray.push(allocation);
    }

    return allocationObjArray;

}

async function pageOnLoad(){

    await retrAccount();

    if(account){
        window.location.href = "#" + account;
        $("#connectedAccount").html(account);
        $("#connectedAccount").attr("target", "_blank");
        $("#connectedAccount").attr("href", constants_urls.etherscan + account);
        $("#overlay").fadeOut(700);
    }else{
        $("#overlay").show();
    }

}

async function initEthereum(){
    ethereum.autoRefreshOnNetworkChange = false;
    $("#connectedAccount").click(async function(){
        await connectToMetaMask();
    })
}

async function initContracts(){
    contracts.CompFarmingSummaryV3 = new web3.eth.Contract(abis["CompFarmingSummaryV3"], addresses.CompFarmingSummaryV3);
}

async function getAccountProfile(){
    const accountProfileResultRaw = await contracts.CompFarmingSummaryV3.methods.getAccountProfile(account).call();

    return accountProfileResultRaw;
}

async function getAccountInterestProfile(numberOfBlocks){
    const accountInterestProfileResultRaw = await contracts.CompFarmingSummaryV3.methods.getAccountInterestProfile(account, numberOfBlocks).call();

    const interestAbs = (accountInterestProfileResultRaw.totalInterestInUSD_ / 10**18).toFixed(2);
    if(accountInterestProfileResultRaw.isPositiveInterest_){
        return interestAbs;
    }

    return -interestAbs;
}

async function getTotalCompReceivable(numberOfBlocks){
    const compReceivableResultRaw = await contracts.CompFarmingSummaryV3.methods.getTotalCompReceivable(account, numberOfBlocks).call();

    return (compReceivableResultRaw / 10**18).toFixed(2);
}

async function getCompPriceInUSD(){
    const compPriceInUSDResultRaw = await contracts.CompFarmingSummaryV3.methods.getCOMPPriceInUSD().call();

    return (compPriceInUSDResultRaw / 10**18).toFixed(2);
}

async function getFarmingAccountProfile(accountProfileAsInput){
    const targetedBorrowLimitPCT_asInput = (targetedBorrowLimitPCT*10**18).toString();
    const farmingAccountProfileResultObjRaw = await contracts.CompFarmingSummaryV3.methods.getFarmingAccountProfileByAP(accountProfileAsInput, targetedBorrowLimitPCT_asInput).call();
    if(!farmingAccountProfileResultObjRaw.isValidated){
        return null;
    }

    return farmingAccountProfileResultObjRaw.farmingAccountProfile;
}

async function getAccountInterestProfileByAP(accountProfileAsInput, numberOfBlocks){
    const accountInterestProfileResultRaw = await contracts.CompFarmingSummaryV3.methods.getAccountInterestProfileByAP(accountProfileAsInput, numberOfBlocks).call();

    const interestAbs = (accountInterestProfileResultRaw.totalInterestInUSD_ / 10**18).toFixed(2);
    if(accountInterestProfileResultRaw.isPositiveInterest_){
        return interestAbs;
    }

    return -interestAbs;
}

async function getTotalCompReceivablByAP(accountProfileAsInput, numberOfBlocks){
    const compReceivableByAccountProfileResultRaw = await contracts.CompFarmingSummaryV3.methods.getTotalCompReceivablByAP(accountProfileAsInput, numberOfBlocks).call();

    return (compReceivableByAccountProfileResultRaw / 10**18).toFixed(2);
}

async function getMaxInterestAccountProfileByAP(accountProfileAsInput){
    const maxInterestAccountProfileByAPResultRaw = await contracts.CompFarmingSummaryV3.methods.getMaxInterestAccountProfileByAP(accountProfileAsInput).call();

    if(!maxInterestAccountProfileByAPResultRaw.isValidated){
        return null;
    }

    return maxInterestAccountProfileByAPResultRaw.maxInterestAccountProfile;
}

async function getLiquidationRiskRankingByAP(accountProfileWrapped){
    const liquidationRiskRankingByAPResultRaw = await contracts.CompFarmingSummaryV3.methods.getLiquidationRiskRankingByAP(accountProfileWrapped).call();
    var result;

    switch (parseInt(liquidationRiskRankingByAPResultRaw)) {
      case 0:
        result = "No";
        break;
      case 1:
        result = "Borrow Interest Charge";
        break;
      case 2:
         result = "Asset Price Movement";
        break;
    }

    return result;
}



async function retCompProfile(){
    var result = await contracts.CompFarmingSummaryV3.methods.getCompProfile(account).call();

    data_comp_profile.COMPBalance = roundMantissa(result[0], 18, 2);
    data_comp_profile.COMPYetToClaim = roundMantissa(result[1], 18, 2);
    data_comp_profile.totalCOMP = (data_comp_profile.COMPBalance + data_comp_profile.COMPYetToClaim).toFixed(2);
    data_comp_profile.currentCOMPValueInUSD = parseFloat((parseFloat(data_comp_profile.totalCOMP) * compPriceInUSD).toFixed(2));

}

async function retrAccount(){
    var url = window.location.href;
    if(url.indexOf("#") >= 0){
        account = window.location.href.split("#")[1];
    }

    if(!account){
        var accounts = await web3.eth.getAccounts();
        account = accounts[0];
    }
}

function roundMantissa(numberMantissa, mantissaScale, scale){
    return parseFloat((numberMantissa / 10**mantissaScale).toFixed(scale));
}


function initChartJS(){
    Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
    Chart.defaults.global.defaultFontColor = '#858796';
}

function clone(obj){
    return JSON.parse(JSON.stringify(obj));
}

function rawStructReturnToInput(struct){
  return JSON.parse(JSON.stringify(struct, null, 4));
}

function isSameAddress(a, b){
   return (web3.utils.toChecksumAddress(a) == web3.utils.toChecksumAddress(b));
}

async function createHBhtml(data, url){
    Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('ifNotEquals', function(arg1, arg2, options) {
      return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
    });

    var template = await $.get(url);
    var theTemplate = Handlebars.compile(template);
    var theCompiledHtml = theTemplate(data);

    return theCompiledHtml;
}

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

function createCOMPProfileChart(){
      var ctx = document.getElementById("myPieChart");
      var myPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ["COMP Earned", "COMP accured yet to claim"],
          datasets: [{
            data: [data_comp_profile.COMPBalance, data_comp_profile.COMPYetToClaim],
            backgroundColor: ['#1cc88a', '#36b9cc'],
            hoverBackgroundColor: ['#17a673', '#2c9faf'],
            hoverBorderColor: "rgba(234, 236, 244, 1)",
          }],
        },
        options: {
          maintainAspectRatio: false,
          tooltips: {
            backgroundColor: "rgb(255,255,255)",
            bodyFontColor: "#858796",
            borderColor: '#dddfeb',
            borderWidth: 1,
            xPadding: 15,
            yPadding: 15,
            displayColors: false,
            caretPadding: 10,
          },
          legend: {
            display: false
          },
          cutoutPercentage: 0,
        },
      });
}
