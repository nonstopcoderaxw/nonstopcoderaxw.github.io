
const url = "https://api.thegraph.com/subgraphs/name/nonstopcoderaxw/compoundliquidationstatus";

async function getPriceWrittenAddresses(){
    const query = `{
                      priceWrittenAddresses(first: 1000) {
                        id
                        address
                        numberOfWrittens
                        recentTimeStamp
                        recentBlockNumber
                      }
                  }`
    const result = await $.post({
        url: url,
        type: "POST",
        data: JSON.stringify({query: query}),
        contentType: "application/json"
    });

    return result.data;
}

async function getProfitableLiquidation(){
    const query = `{
                      liquidationTxProfits(first:1000, orderBy: profit, orderDirection: desc){
                            id
                            liquidationTx {
                              id
                              tx
                              liquidator
                              blockNumber
                              timestamp
                            }
                            gasCostInUSD
                            repaidCostInUSD
                            totalCost
                            income
                            profit
                      }
                  }
    `
    const result = await $.post({
        url: url,
        type: "POST",
        data: JSON.stringify({query: query}),
        contentType: "application/json"
    });

    return result.data;
}

async function getLiquidators(){
    const query = `{
                    liquidators(first:1000, orderBy: totalProfitInUSD, orderDirection: desc) {
                        id
                        address
                        totalProfitInUSD
                        numberOfLiquidations
                    	}
                    }
                  `
      const result = await $.post({
          url: url,
          type: "POST",
          data: JSON.stringify({query: query}),
          contentType: "application/json"
      });

      return result.data;
}

async function getLiquidationTxByBlockNumber(blockNumber){
    const query = `
              {
                      liquidationTxProfits(first: 1000, where: {blockNumber : "${blockNumber}"}, orderBy: txIndex, orderDirection: desc){
                            id
                            liquidationTx {
                              id
                              tx
                              liquidator
                              blockNumber
                              timestamp
                            }
                            txIndex
                            blockNumber
                            gasCostInUSD
                            repaidCostInUSD
                            totalCost
                            income
                            profit
                      }
                  }
    `
    const result = await $.post({
        url: url,
        type: "POST",
        data: JSON.stringify({query: query}),
        contentType: "application/json"
    });

    return result.data;
}

async function getLiquidationTxByLiquidator(liquidator){
      const query = `
      {
                        liquidationTxProfits(first: 1000, where: {liquidator : "${liquidator}"}, orderBy: txIndex, orderDirection: desc){
                              id
                              liquidationTx {
                                id
                                tx
                                liquidator
                                blockNumber
                                timestamp
                              }
                              liquidator
                              txIndex
                              blockNumber
                              gasCostInUSD
                              repaidCostInUSD
                              totalCost
                              income
                              profit
                        }
                    }
      `
      const result = await $.post({
          url: url,
          type: "POST",
          data: JSON.stringify({query: query}),
          contentType: "application/json"
      });

      return result.data;
}

async function getLiquidatedBlocks(){
      const query = `
                        {
                            liquidationBlocks(first: 1000, orderBy: numberOfLiquidations, orderDirection: desc) {
                                id
                                blockNumber
                                numberOfLiquidations
                                timestamp
                            }
                        }
      `
      const result = await $.post({
          url: url,
          type: "POST",
          data: JSON.stringify({query: query}),
          contentType: "application/json"
      });

      return result.data;
}


export{
    getPriceWrittenAddresses,
    getProfitableLiquidation,
    getLiquidators,
    getLiquidationTxByLiquidator,
    getLiquidationTxByBlockNumber,
    getLiquidatedBlocks
}
