var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);

app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/js')); 
app.use(express.static(__dirname + '/css'));  
app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/index.html');
});
server.listen(4500 , function(){
    console.log("Server start listening on port 4500.......");
})
var firstPlays = [];
var secondPlays = [];
var firstWin = 0;
var secondWin = 0;
var clients = [];
var turns= 0;
var noOfWonGames;
io.on("connection" , function(client) { 
         
    if(clients.length >= 2) {
        client.leave();
    }
    clients.push(client.id);

    if(clients.length == 2) {
        io.sockets.emit("startGame" , "Let's Start");        
    } 
    else if(clients.length == 1) {             
        client.emit("wait" , "Please wait until second player to join ");
    }

    // Events turn finished with position of li on both 
    var hasWon = false;    
    var drawPlay = false;
    client.on("played",function(data) {
        // firstplays for client before last
        if(client.id == clients[clients.length-2]) {
            firstPlays.push(data);
             hasWon = checkStatus(firstPlays);
             turns++;
             if(hasWon){
                 firstWin ++;
             }
        }
        // secondplays for last client
        if(client.id == clients[clients.length-1]) {
           secondPlays.push(data);
           hasWon = checkStatus(secondPlays);
           turns++;
           if(hasWon) {
               secondWin++;
           }
        }
        if(turns == 9 && !hasWon) {
            drawPlay = true;
        }

        noOfWonGames = {"first":firstWin , "second":secondWin};
        var datanew ={"senderid":client.id , "pos":data , "Won":hasWon , "Draw":drawPlay , "WinGames":noOfWonGames}
        io.sockets.emit("played" , datanew);
    })

    client.on("restartGame", function() {
        ClearValues();
        noOfWonGames= {"first":firstWin , "second":secondWin};
        io.sockets.emit("GameStart", noOfWonGames );
    })


    var checkStatus = function (arr) {
        var hasWon = false;
        if (arr.length >= 3) {
            var lt_br_points = 0;  // left top to right bottom diagonal points
            var rt_bl_points = 0; // right top to left bottom diagonal points
            var first_row = 0 // first row points
            var second_row = 0 // second row points
            var third_row = 0 //  third row points
            var first_col = 0 // first col  points
            var second_col = 0 // second col  points
            var third_col = 0 // third col  points
            for (var i = 0; i < arr.length; i++) {
                if (arr[i][0] == arr[i][1]) {
                    lt_br_points++;
                }

                if (parseInt(arr[i][0]) + parseInt(arr[i][1]) == 2) {
                    rt_bl_points++;
                }

                if (parseInt(arr[i][0]) == 0) {
                    first_row++;
                }

                if (parseInt(arr[i][0]) == 1) {
                    second_row++;
                }

                if (parseInt(arr[i][0]) == 2) {
                    third_row++;
                }

                if (parseInt(arr[i][1]) == 0) {
                    first_col++;
                }

                if (parseInt(arr[i][1]) == 1) {
                    second_col++;
                }

                if (parseInt(arr[i][2]) == 2) {
                    third_col++;
                }
            }

            if (lt_br_points == 3 || rt_bl_points == 3 || first_row == 3 || first_col == 3 || second_row == 3
                || second_col == 3 || third_row == 3 || third_col == 3) {
                hasWon = true;
                ClearValues();
            }
        }
        return hasWon;
    }
    
    function ClearValues(){
        lt_br_points = 0;
        rt_bl_points = 0;
        first_col = 0;
        first_row = 0;
        second_col = 0;
        second_row = 0;
        third_col = 0;
        third_row = 0;
        firstPlays = [];
        secondPlays = [];
        turns = 0;
    }
    client.on("disconnect", function(){});
})
