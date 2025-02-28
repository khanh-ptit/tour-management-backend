const Service = require("../../models/service.model");

// [GET] /api/v1/admin/services
module.exports.index = async (req, res) => {
  try {
    const services = await Service.find({ deleted: false });
    res.json(services);
  } catch (error) {
    console.log(error);
  }
};
