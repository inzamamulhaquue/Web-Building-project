const { Router } = require("express");
const AgreementRoute = Router();
const Agreement = require("../controller/enquiry/agreement");

AgreementRoute.post("/addAgreement", Agreement.addAgreement);
AgreementRoute.get("/getAgreement/:registryId", Agreement.downloadpdf);
AgreementRoute.post("/debitAmount", Agreement.debitAmount);

module.exports = AgreementRoute;
