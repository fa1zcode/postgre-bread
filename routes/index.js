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
      const jumlahHalaman = Math.ceil(Number(raw.total) / limit);
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

  return router;
};
