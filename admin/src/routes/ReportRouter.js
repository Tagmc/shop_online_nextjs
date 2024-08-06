const express = require("express");
const router = express.Router();
const { CONFIG_PERMISSIONS } = require("../configs");
const { AuthPermission } = require("../middleware/AuthPermission");
const ReportController = require("../controllers/ReportController")

router.get(
  "/product-type/count",
  AuthPermission(CONFIG_PERMISSIONS.DASHBOARD),
  ReportController.getReportCountProductType
);

router.get(
  "/all-records/count",
  AuthPermission(CONFIG_PERMISSIONS.DASHBOARD),
  ReportController.getReportCountRecords
);

module.exports = router;
