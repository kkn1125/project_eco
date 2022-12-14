import Query from "../models/Query";

Query.enter = (req, res, next) => {
  res.status(200).json({
    ok: true,
  });
};
Query.login = (req, res, next) => {
  res.status(200).json({
    ok: true,
  });
};
Query.logout = (req, res, next) => {
  res.status(200).json({
    ok: true,
  });
};

const queryService = Query;

export default queryService;
