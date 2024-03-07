const fetch = require('node-fetch')
const strideApi="https://rest.cosmos.directory/stride"


async function getJsonValueFromUrl(url) {
    const response = await fetch(url, {
        method: 'GET'});
    if (!response.ok) {
        console.error("failed to fetch")
    }
    if (response.body !== null) {
        const res=await response.json()
        return res
    }
}




async function getPoolStosmoRatio() {
    let url = "https://api-osmosis.imperator.co/pairs/v1/historical/833/chart?asset_in=ibc/D176154B0C63D1F9C6DCFB4F70349EBF2E2B5A87A05902F57A6AE92B863E9AEC&asset_out=uosmo&range=7d&asset_type=denom"
    let data = await getJsonValueFromUrl(url);

    let latestData= data[data.length - 1]
    return 1/latestData.close
}


async function getPoolStatomRatio() {
    let url = "https://api-osmosis.imperator.co/pairs/v1/historical/803/chart?asset_in=ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2&asset_out=ibc/C140AFD542AE77BD7DCC83F13FDD8C5E5BB8C4929785E6EC2F4C636F98F17901&range=7d&asset_type=denom"
    let data = await getJsonValueFromUrl(url);
    let latestData= data[data.length - 1]
    return latestData.close
}


async function getStosmoRedeemRatio(){
    let url = strideApi+"/Stride-Labs/stride/stakeibc/host_zone"
    let data = await getJsonValueFromUrl(url);
    for (let i=0;i<data.host_zone.length;i++){
        if (data.host_zone[i].chain_id=="osmosis-1"){
            let ratio=data.host_zone[i].redemption_rate
            return ratio
        }
    }

}


async function getStatomRedeemRatio(){
    let url = strideApi+"/Stride-Labs/stride/stakeibc/host_zone"
    let data = await getJsonValueFromUrl(url);
    for (let i=0;i<data.host_zone.length;i++){
        if (data.host_zone[i].chain_id=="cosmoshub-4"){
            let ratio=data.host_zone[i].redemption_rate
            return ratio
        }
    }

}

async function getStosmoArbiProfit(){
    let poolRatio=await getPoolStosmoRatio()
    let redeemRatio=await getStosmoRedeemRatio()
    let profit=(redeemRatio-poolRatio)/poolRatio
    console.log("stosmo arbi profit: "+profit)
    return profit

}


async function getStatomArbiProfit(){
    let poolRatio=await getPoolStatomRatio()
    let redeemRatio=await getStatomRedeemRatio()
    let profit=(redeemRatio-poolRatio)/poolRatio
    console.log("statom arbi profit: "+profit)
    return profit
}

async function compareProfits() {
    let stosmoProfit = await getStosmoArbiProfit();
    let statomProfit = await getStatomArbiProfit();

    let stosmoDays = 14;
    let statomDays = 21;

    let annualizedStosmoProfit = stosmoProfit * (365 / stosmoDays);
    let annualizedStatomProfit = statomProfit * (365 / statomDays);

    console.log("Annualized stosmo arbi profit: " + annualizedStosmoProfit);
    console.log("Annualized statom arbi profit: " + annualizedStatomProfit);

    if(annualizedStosmoProfit > annualizedStatomProfit) {
        console.log("Stosmo arbitrage is more profitable.")
    } else if (annualizedStosmoProfit < annualizedStatomProfit) {
        console.log("Statom arbitrage is more profitable.")
    } else {
        console.log("Both have the same profit.")
    }
}

module.exports = { getStosmoArbiProfit, getStatomArbiProfit, compareProfits }

