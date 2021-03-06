var Datastore = require('nedb');
var ODataServer = require("../index.js");
var model = require("./model.js");
var should = require("should");


describe("neDBAdapter", function () {
    var odataServer;
    var db;
    beforeEach(function () {
        db = new Datastore({inMemoryOnly: true});
        odataServer = ODataServer("http://localhost:1234");
        odataServer.model(model);
        odataServer.onNeDB(function (coll, cb) {
            cb(null, db);
        })
    });

    it("insert should add _id", function (done) {
        odataServer.cfg.insert("test", {foo: "Hello"}, function (err, doc) {
            if (err)
                return done(err);

            doc.should.have.property("_id");
            done();
        });
    });

    it("remove should remove", function (done) {
        db.insert({foo: "Hello"}, function(err) {
            if (err)
                return done(err);

            odataServer.cfg.remove("test", {}, function (err) {
                if (err)
                    return done(err);

                db.count({}, function(err, val) {
                    if (err)
                        return done(err);

                    val.should.be.eql(0);
                    done();
                });
            });
        });
    });

    it("update should update", function (done) {
        db.insert({foo: "Hello"}, function(err) {
            if (err)
                return done(err);

            odataServer.cfg.update("test", { foo: "Hello"}, { $set: { foo: "updated"}}, function (err) {
                if (err)
                    return done(err);

                db.find({}, function(err, val) {
                    if (err)
                        return done(err);

                    val[0].foo.should.be.eql("updated");
                    done();
                });
            });
        });
    });

    it("query should be able to filter in", function (done) {
        db.insert({foo: "Hello"}, function(err) {
            if (err)
                return done(err);

            odataServer.cfg.query("test", { foo: "Hello"}, function (err, res) {
                if (err)
                    return done(err);

                res.should.have.length(1);
                done();
            });
        });
    });

    it("query should be able to filter out", function (done) {
        db.insert({foo: "Hello"}, function(err) {
            if (err)
                return done(err);

            odataServer.cfg.query("test", { foo: "different"}, function (err, res) {
                if (err)
                    return done(err);

                res.should.have.length(1);
                done();
            });
        });
    });
});