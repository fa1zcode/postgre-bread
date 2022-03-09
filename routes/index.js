var express = require("express");
const { rows } = require("pg/lib/defaults");
var router = express.Router();

module.exports = function (db) {
  /* GET home page. */
  router.get("/", function (req, res) {
    const url = req.url == "/" ? "/?page=1" : req.url;

    let params = [];

    if (req.query.string) {
      params.push(`stringdata ilike '%${req.query.string}%'`);
    }
    if (req.query.integer) {
      params.push(`integerdata = ${req.query.integer}`);
    }
    if (req.query.float) {
      params.push(`floatdata like '${req.query.float}' `);
    }
    if (req.query.startDate && req.query.endDate) {
      params.push(
        `datedata BETWEEN DATE('${req.query.startDate}') AND DATE('${req.query.endDate}') `
      );
    }
    if (req.query.boolean) {
      params.push(`booleandata = ${req.query.boolean}`);
    }

    const page = req.query.page || 1;
    const limit = 3;
    const offset = (page - 1) * limit;

    let sql = "select count(*) as total from todo";
    if (params.length > 0) {
      sql += ` where ${params.join(" and ")}`;
    }

    db.query(sql, (err, raw) => {
      const jumlahHalaman = Math.ceil(Number(raw.rows[0].total) / limit);
      console.log(raw.rows)
      sql = `select * from todo`;
      if (params.length > 0) {
        sql += ` where ${params.join(" and ")}`;
      }
      sql += ` limit $1 offset $2`;

      console.log(sql);

      db.query(sql, [limit, offset], (err, raws) => {
        console.log(raws.rows);
        if (err) return res.send(err);
        res.render("list", {
          data: raws.rows,
          page,
          jumlahHalaman,
          query: req.query,
          url,
        });
      });
    });
  });

  router.get("/add", function (req, res) {
    res.render("add");
  });

  router.post("/add", function (req, res) {
    // query binding = use (?) to prevent hack via sql injection
    db.query(
      `insert into todo (stringdata, integerdata, floatdata, datedata, booleandata) values ($1,$2,$3,$4,$5)`,
      [
        req.body.string,
        parseInt(req.body.integer),
        parseFloat(req.body.float),
        req.body.date,
        JSON.parse(req.body.boolean),
      ],
      (err, raws) => {
        if (err) return res.send(err);
        console.log(req, res);
        res.redirect("/");
      }
    );
  });

  router.get("/delete/:id", function (req, res) {
    const id = Number(req.params.id);
    db.query("delete from todo where id = $1 ", [id], (err, raws) => {
      if (err) return res.send(err);
      console.log(raws);
      res.redirect("/");
    });
  });

  router.get("/edit/:id", function (req, res) {
    const id = Number(req.params.id);
    db.query("select * from todo where id = $1", [id], (err, raws) => {
      if (err) return res.send(err);
      console.log(raws.rows[0]);
      res.render("edit", { data: raws.rows[0] });
    });
  });

  router.post("/edit/:id", function (req, res) {
    const id = Number(req.params.id);
    db.query(
      "update todo set stringdata = $1, integerdata = $2, floatdata = $3, datedata = $4, booleandata = $5 where id = $6",
      [
        req.body.string,
        parseInt(req.body.integer),
        parseFloat(req.body.float),
        req.body.date,
        JSON.parse(req.body.boolean),
        id,
      ],
      (err, row) => {
        if (err) return res.send(err);
        res.redirect("/");
      }
    );
    console.log(req.query)
  });

  return router;
};
