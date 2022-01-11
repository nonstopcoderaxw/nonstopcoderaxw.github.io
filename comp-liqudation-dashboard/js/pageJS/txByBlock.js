import * as APICallouts from "../modules/apiCallouts.js";
import * as UIHb from "../modules/UIHb.js";
import * as UICommon from "../modules/UICommon.js";
import * as GVFuncs from "../modules/GVFuncs.js";


start();

var blockNumber;

async function start(){
    await UIHb.createTemplateComponents();

    blockNumber = UICommon.findGetParameter("blockNumber");
    await UIGV_TableTxByBlock();

    await UIOps();
}

async function UIGV_TableTxByBlock(){
      google.charts.load('current', {'packages':['table']});
      google.charts.setOnLoadCallback(UIGV_TableTxByBlockDRAW);
}

async function UIGV_TableTxByBlockDRAW(){
      const sgData = await APICallouts.getLiquidationTxByBlockNumber(blockNumber);

      const _data = sgData.liquidationTxProfits;

      var data = new google.visualization.DataTable();

      data.addColumn('string', 'Tx');
      data.addColumn('string', 'Liquidator');
      data.addColumn('number', 'Tx Index');
      data.addColumn('number', 'Gas In USD');
      data.addColumn('number', 'Profit');


      var rows = [];
      for(var i = 0; i < _data.length; i++){
          const row = [
              _data[i].liquidationTx.tx,
              _data[i].liquidationTx.liquidator,
              parseInt(_data[i].txIndex),
              parseInt(_data[i].gasCostInUSD),
              parseInt(_data[i].profit)
          ];

          rows.push(row);
      }

      data.addRows(rows);

      var table = new google.visualization.Table(document.getElementById('UIGV_TableTxByBlock'));

      table.draw(data, {
                        showRowNumber: true,
                        width: '100%',
                        height: '500px',
                        sortColumn: 2,
                        sortAscending: false});

      $("#blockNumber").html(blockNumber);

}


async function UIOps(){

}
