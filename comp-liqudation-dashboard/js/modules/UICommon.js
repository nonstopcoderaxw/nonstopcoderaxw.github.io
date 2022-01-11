import * as APICallouts from "../modules/apiCallouts.js";


async function UICopyToClipboard(){
    var _temp = $("<input>");
    $('.aCopyValue').on('click', function(e) {
        event.preventDefault();
        $("body").append(_temp);
        _temp.val($(this).attr("data-copy")).select();
        document.execCommand("copy");
        _temp.remove();
    })
}

async function UISearchAddress(){
    $(".aSearch").click(async function(e){
        e.preventDefault();
        const address = $(".cAddressInput").val();
        //validate the address
        //account or contract - 42 length
        if(address.length == 42){
            window.open('/account.html#' + address, '_blank');
        }
        //txn hash - 66 length
        if(address.length == 66){
            window.open('/transaction.html#' + address, '_blank');
        }
        //block number
        if(address.length != 42 && address.length != 66){
            window.open('/block.html#' + address, '_blank');
        }

    })
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

async function UIToggleLoader(){
    $(".loader").toggle();
}

function parse_query_string(query) {
  var vars = query.split("&");
  var query_string = {};
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    var key = decodeURIComponent(pair[0]);
    var value = decodeURIComponent(pair[1]);
    // If first entry with this name
    if (typeof query_string[key] === "undefined") {
      query_string[key] = decodeURIComponent(value);
      // If second entry with this name
    } else if (typeof query_string[key] === "string") {
      var arr = [query_string[key], decodeURIComponent(value)];
      query_string[key] = arr;
      // If third or later entry with this name
    } else {
      query_string[key].push(decodeURIComponent(value));
    }
  }
  return query_string;
}

function timeDifference(timestamp) {
    var current = Date.now();

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - new Date(timestamp * 1000);

    if (elapsed < msPerMinute) {
         return Math.round(elapsed/1000) + ' seconds ago';
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';
    }

    else if (elapsed < msPerMonth) {
         return 'approximately ' + Math.round(elapsed/msPerDay) + ' days ago';
    }

    else if (elapsed < msPerYear) {
         return 'approximately ' + Math.round(elapsed/msPerMonth) + ' months ago';
    }

    else {
         return 'approximately ' + Math.round(elapsed/msPerYear ) + ' years ago';
    }
}

export{
    UICopyToClipboard,
    UISearchAddress,
    UIToggleLoader,
    findGetParameter,
    parse_query_string,
    timeDifference
}
