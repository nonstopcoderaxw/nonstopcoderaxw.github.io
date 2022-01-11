import * as APICallouts from "../modules/apiCallouts.js";
import * as UIHb from "../modules/UIHb.js";
import * as UICommon from "../modules/UICommon.js";
import * as GVFuncs from "../modules/GVFuncs.js";


start();

async function start(){
    await UIHb.createTemplateComponents();

    await UIGV();

    await UIOps();
}

async function UIGV(){
      google.charts.load('current', {'packages':['table']});
      google.charts.setOnLoadCallback(UIGV_TablePriceWrittenAddressesDRAW);
      google.charts.setOnLoadCallback(UIGV_TableProfitableLiquidationDRAW);
      google.charts.setOnLoadCallback(UIGV_TableLiquidatorsDRAW);
      google.charts.setOnLoadCallback(UIGV_TableLiquidationBlocksDRAW);
}

async function UIGV_TableLiquidatorsDRAW(){
      const sgData = await APICallouts.getLiquidators();

      const _data = sgData.liquidators;

      var data = new google.visualization.DataTable();

      data.addColumn('string', 'Liquidator(SC)');
      data.addColumn('number', 'Total Profit In USD');
      data.addColumn('number', 'Number of Liquidations');


      var rows = [];
      for(var i = 0; i < _data.length; i++){
          const row = [
              `<a target="_blank" href="./txByLiquidator.html?lqAddr=${_data[i].address}">${_data[i].address}</a>`,
              parseInt(_data[i].totalProfitInUSD),
              parseInt(_data[i].numberOfLiquidations)
          ];

          rows.push(row);
      }

      data.addRows(rows);

      var table = new google.visualization.Table(document.getElementById('UIGV_TableLiquidators'));

      table.draw(data, {
                        showRowNumber: true,
                        width: '100%',
                        height: '500px',
                        sortColumn: 1,
                        sortAscending: false,
                        allowHtml:true});

      $("#UIGV_TableLiquidatorsSection .cDesc").html("<strong style='font-size:30px'>" + _data.length + "</strong>" + " different liquidators found.");

}

async function UIGV_TableProfitableLiquidationDRAW(){
      const sgData = await APICallouts.getProfitableLiquidation();

      const _data = sgData.liquidationTxProfits;

      var data = new google.visualization.DataTable();

      data.addColumn('string', 'Tx');
      data.addColumn('number', 'Profit In USD');
      data.addColumn('number', 'Gas Cost In USD');


      var rows = [];
      for(var i = 0; i < _data.length; i++){
          const row = [
              _data[i].liquidationTx.tx,
              parseInt(_data[i].profit),
              parseInt(_data[i].gasCostInUSD)


          ];

          rows.push(row);
      }

      data.addRows(rows);

      var table = new google.visualization.Table(document.getElementById('UIGV_TableProfitableLiquidation'));

      table.draw(data, {
                        showRowNumber: true,
                        width: '100%',
                        height: '500px',
                        sortColumn: 1,
                        sortAscending: false});



}


async function UIGV_TablePriceWrittenAddressesDRAW() {
        const sgData = await APICallouts.getPriceWrittenAddresses();

        var _data = sgData.priceWrittenAddresses;

        var data = new google.visualization.DataTable();

        data.addColumn('string', 'Address');
        data.addColumn('datetime', 'Recent Date');
        data.addColumn('number', 'Recent Block Number');
        data.addColumn('number', 'Number of Updates');

        var rows = [];
        for(var i = 0; i < _data.length; i++){
            const row = [
                _data[i].address,
                GVFuncs.timestampToDateTimeLocal(_data[i].recentTimeStamp),
                parseInt(_data[i].recentBlockNumber),
                parseInt(_data[i].numberOfWrittens)
            ];

            rows.push(row);
        }

        data.addRows(rows);

        var table = new google.visualization.Table(document.getElementById('UIGV_TablePriceWrittenAddresses'));

        table.draw(data, {
                          showRowNumber: true,
                          width: '100%',
                          height: '500px',
                          sortColumn: 1,
                          sortAscending: false,
                          allowHtml: true
                          });

      $("#UIGV_TablePriceWrittenAddressesSection .cDesc").html("<strong style='font-size:30px'>" + _data.length + "</strong>" + " different addresses found that have updated the Compound price oracle.");
}

async function UIGV_TableLiquidationBlocksDRAW() {
        const sgData = await APICallouts.getLiquidatedBlocks();

        var _data = sgData.liquidationBlocks;

        var data = new google.visualization.DataTable();

        data.addColumn('string', 'Block Number');
        data.addColumn('string', 'When');
        data.addColumn('number', 'Number of Liquidations');

        var rows = [];
        for(var i = 0; i < _data.length; i++){
            const row = [
                `<a target="_blank" href="./txByBlock.html?blockNumber=${_data[i].blockNumber}">${_data[i].blockNumber}</a>`,
                UICommon.timeDifference(_data[i].timestamp),
                parseInt(_data[i].numberOfLiquidations)
            ];

            rows.push(row);
        }

        data.addRows(rows);

        var table = new google.visualization.Table(document.getElementById('UIGV_TableLiquidationBlocks'));

        table.draw(data, {
                          showRowNumber: true,
                          width: '100%',
                          height: '500px',
                          sortColumn: 0,
                          sortAscending: false,
                          allowHtml: true
                          });

}


async function UIOps(){

}
