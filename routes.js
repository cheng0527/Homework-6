"use strict";

var redis = require("redis");
var client = redis.createClient();

module.exports = function (app) {

    function generateRandomAnswer() {
        var arr = ["heads", "tails"];
        return arr[Math.floor(Math.random() * arr.length)];
    }

    app.post("/flip", function (req, res, next) {
        var call = req.body.call;
        if (call !== "heads" && call !== "tails") {
            next(new Error("Call value should be 'heads' or 'tails'! "));
            return;
        }

        if (call === generateRandomAnswer()) {
            client.hincrby("redis-experiment:result", "win", 1, function (err, result) { // jshint ignore:line
                if (err) {
                    res.json({
                        error: err
                    });
                    return;
                }
                res.json({
                    result: "win"
                });
            });

        } else {
            client.hincrby("redis-experiment:result", "lose", 1, function (err, result) {// jshint ignore:line
                if (err) {
                    res.json({
                        error: err
                    });
                    return;
                }
                res.json({
                    result: "lose"
                });
            });
        }
    });

    app.get("/stats", function (req, res) {
        client.hgetall("redis-experiment:result", function (err, result) {
            if (err) {
                res.json({
                    error: err
                });
                return;
            }
            // if the
            if (result === null) {
                res.json({
                    win: 0,
                    lose: 0
                });
            } else {
                res.json({
                    win: result.win || 0,
                    lose: result.lose || 0
                });
            }
        });
    });

    app.delete("/stats", function (req, res) {
        client.del("redis-experiment:result", function (err, result) {// jshint ignore:line
            if (err) {
                res.json({
                    error: err
                });
                return;
            }
            res.json({
                result: "success"
            });
        });
    });

};
