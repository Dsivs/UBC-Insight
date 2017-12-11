/**
 * Created by John on 2017-03-23.
 */


//# is referring to id
$("#submit").click(function(){
    //alert('pressed');
    var file = document.getElementById("fileUpload").files[0];//mean first file
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = function (evt) {
        var id = file.name.split('.')[0];
        var content = evt.target.result;
        var formData = new FormData();
        formData.append('body', new Blob([content]));//blob is used to keep base64

        $.ajax({
            url: 'http://localhost:63342/dataset/' + id,
            type: 'PUT',
            crossOrigin: true,
            data: formData,
            cache: false,
            contentType: false,
            processData: false
        }).done( function(data) {
            console.log(file.name + 'is uploaded!');
        }).fail( function(err) {
            console.log('error is returned = ' + err);
        });
    }
});

$('#submitt').click(function () {
    //get content of text field
    var query = $("#txtQuery").val();
    $.ajax({
        url: 'http://localhost:63342/query',
        type: 'POST',
        data: JSON.stringify(query),
        dataType: 'json',
        crossOrigin: true,
        cache: false,
        contentType: 'application/json'
    }).done( function(data){
        //data will be the result json obj
        console.log('response: ' + data);
        generateTable(data.result);
    }).fail( function(err){
        console.log('error = ' + err.description);
    });
});

function generateTable(data) {
    var tbl_body = document.createElement("tbody");
    var odd_even = false;
    console.log("DATA", data);
    $.each(data, function() {
        var tbl_row = tbl_body.insertRow();
        tbl_row.className = odd_even ? "odd" : "even";
        $.each(this, function(k , v) {
            var cell = tbl_row.insertCell();
            cell.appendChild(document.createTextNode(v.toString()));
        });
        odd_even = !odd_even;
    });
    document.getElementById("tblResults").appendChild(tbl_body);
    // $("#tblResults").appendChild(tbl_body);
}


function generateTables(data) {
    var columns = [];
    Object.keys(data[0]).forEach(function(title) {
        columns.push({
            head: title,
            cl: "title",
            html: function(d) {return d[title]}
        });
    });
    var container = document.getElementById("#render");
    container.html("");
    container.selectAll("*").remove();
    var table = container.append("table").style("margin", "auto");

    table.append("thead").append("tr")
        .selectAll("th")
        .data(columns).enter()
        .append("th")
        .attr("class", function(d) {return d["cl"]})
        .text(function(d) {return d["head"]});

    table.append("tbody")
        .selectAll("tr")
        .data(data).enter()
        .append("tr")
        .selectAll("td")
        .data(function(row, i) {
            return columns.map(function(c) {
                // compute cell values for this specific row
                var cell = {};
                d3.keys(c).forEach(function(k) {
                    cell[k] = typeof c[k] == "function" ? c[k](row,i) : c[k];
                });
                return cell;
            });
        }).enter()
        .append("td")
        .html(function(d) {return d["html"]})
        .attr("class", function(d) {return d["cl"]});
}


//$("buttom") will be referring to all buttoms in this html

