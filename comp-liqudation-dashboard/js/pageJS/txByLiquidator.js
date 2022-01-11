import * as APICallouts from "../modules/apiCallouts.js";
import * as UIHb from "../modules/UIHb.js";
import * as UICommon from "../modules/UICommon.js";
import * as GVFuncs from "../modules/GVFuncs.js";


start();

var lqAddr;

async function start(){
    await UIHb.createTemplateComponents();

    lqAddr = UICommon.findGetParameter("lqAddr");

    await UIGV_TableTxByLiquidator();

    await UIOps();
}

async function UIGV_TableTxByLiquidator(){
      google.charts.load('current', {'packages':['table']});
      google.charts.setOnLoadCallback(UIGV_TableTxByLiquidatorDRAW);
}

async function UIGV_TableTxByLiquidatorDRAW(){
      const sgData = await APICallouts.getLiquidationTxByLiquidator(lqAddr);

      const _data = sgData.liquidationTxProfits;

      var data = new google.visualization.DataTable();

      data.addColumn('string', 'Tx');
      data.addColumn('number', 'Block Number');
      data.addColumn('number', 'Profit');


      var rows = [];
      for(var i = 0; i < _data.length; i++){
          const row = [
              _data[i].liquidationTx.tx,
              parseInt(_data[i].blockNumber),
              parseInt(_data[i].profit)
          ];

          rows.push(row);
      }

      data.addRows(rows);

      var table = new google.visualization.Table(document.getElementById('UIGV_TableTxByLiquidator'));

      table.draw(data, {
                        showRowNumber: true,
                        width: '100%',
                        height: '500px',
                        sortColumn: 1,
                        sortAscending: false});

      $("#lqAddr").html(lqAddr);

}


async function UIOps(){

}
