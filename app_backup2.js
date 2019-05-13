const Influx = require('influx');
const express = require('express');
const http = require('http');
const os = require('os');

const app = express();

const influx = new Influx.InfluxDB({
    host: '10.11.90.15',
    database: 'Wind_Station',
    schema: [
        {
            measurement: 'WS_MT1',
            fields: {
                path: Influx.FieldType.STRING,
                duration: Influx.FieldType.INTEGER
            },
            tags: [
                'host'
            ]
        }
    ]
});


influx.getDatabaseNames()
    .then(names => {
        if (!names.includes('Wind_Station')) {
            return influx.createDatabase('Wind_Station');
        }
    })
    .then(() => {
        // http.createServer(app).listen(3000, function () {
        app.listen(3002, function () {
            console.log('Listening on port 3002')
        })
    })
    .catch(err => {
        console.error(`Error creating Influx database!`);
    });

// app.use((req, res, next) => {
//     const start = Date.now();
//
//     res.on('finish', () => {
//         const duration = Date.now() - start;
//         console.log(`Request to ${req.path} took ${duration}ms`);
//
//         influx.writePoints([
//             {
//                 measurement: 'test1',
//                 tags: { host: os.hostname() },
//                 fields: { duration, path: req.path },
//             }
//             ]
//         ).catch(err => {
//             console.error('Error saving data to InfluxDB! ${err.stack}')
//         })
//     });
//
//     return next()
// });

app.get('/', function (req, res) {
    setTimeout(() => res.end('Hello world!'), Math.random() * 500)
});

var v1 =[];
app.get('/times', function (req, res) {
    influx.query('select * from WS_MT1'
        //       `
        //   select * from test1
        //   where host = ${Influx.escape.stringLit(os.hostname())}
        //   order by time desc
        //   limit 10
        // `
    ).then(result => {
        console.log(result.length);
        // for (var i = 0; i<result.length; i++)
        // {
        //     v1.push(result[i].Hum_Out);
        // }
        //res.send(v1)
        res.send(result)
    }).catch(err => {
        res.status(500).send(err.stack)
    })
});

app.get('/filterUser', function (req, res) {
    var myStat = "SELECT Hum_Out, time FROM WS_MT1 WHERE time >= '" + req.query.timeFrom + "' AND time <= '" + req.query.timeTo + "'";
    // var myStat = 'SELECT Hum_Out FROM WS_MT1';
    console.log(myStat);

    // var myQuery = [
    //     {
    //         fieldVal: req.query.timeFrom,
    //         dbCol: "time",
    //         op: " >= '",
    //         adj: req.query.timeFrom
    //     },
    //     {
    //         fieldVal: req.query.timeTo,
    //         dbCol: "time",
    //         op: " >= '",
    //         adj: req.query.timeTo
    //     }
    // ];
    res.setHeader("Access-Control-Allow-Origin", "*");

    influx.query(myStat, function (err, result, fields) {
        var status = [{errStatus: ""}];

        if (err) {
            console.log(err);
            status[0].errStatus = "fail";
            res.send(status);
            res.end();
        } else if (result.length === 0) {
            status[0].errStatus = "no data entry";
            res.send(status);
            res.end();
        } else {
            var Hum_Out = [];

            Hum_Out = JSON.stringify(result, null, "\t");
            console.log(Hum_Out);
            res.send(Hum_Out);
            res.end();
        }
    }).then(result => {
        console.log(result.length);
        res.send(result)
    }).catch(err => {
        res.status(500).send(err.stack)
    });

    // var j = 0;
    //
    // for (var i = 0; i < myQuery.length; i++) {
    //     // console.log("i = " + i);
    //     // console.log("field Value: " + !!myQuery[i].fieldVal);
    //     if (i === myQuery.length - 1) {
    //         if (!!myQuery[i].fieldVal) {
    //             if (j === 0) {
    //                 myStat += " WHERE " + myQuery[i].dbCol + myQuery[i].op + myQuery[i].fieldVal + "'";
    //                 j = 1;
    //                 userQuery()
    //             } else {
    //                 myStat += " AND " + myQuery[i].dbCol + myQuery[i].op + myQuery[i].fieldVal + "'";
    //                 userQuery()
    //             }
    //         } else {
    //             userQuery()
    //         }
    //     } else {
    //         if (!!myQuery[i].fieldVal) {
    //             if (j === 0) {
    //                 myStat += " WHERE " + myQuery[i].dbCol + myQuery[i].op + myQuery[i].fieldVal + "'";
    //                 j = 1;
    //             } else {
    //                 myStat += " AND " + myQuery[i].dbCol + myQuery[i].op + myQuery[i].fieldVal + "'";
    //             }
    //         }
    //     }
    // }

});
