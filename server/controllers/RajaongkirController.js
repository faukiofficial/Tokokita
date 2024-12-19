const axios = require("axios");
exports.getShippingCostController = async (req, res) => {
  try {
    const { origin, destination, weight, courier } = req.body;

    if (!origin || !destination || !weight || !courier) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required parameters" });
    }

    const rajaongkir = await axios.post(
      "https://api.rajaongkir.com/starter/cost",
      new URLSearchParams({
        origin,
        destination,
        weight,
        courier,
      }),
      {
        headers: {
          key: process.env.RAJAONGKIR_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.status(200).json({
      success: true,
      rajaongkir: rajaongkir.data.rajaongkir,
      message: "Shipping cost fetched successfully",
    });
  } catch (error) {
    console.log(error.response?.data || error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to get shipping cost" });
  }
};

exports.getProvinces = async (req, res) => {
  try {
    const provinces = await axios.get(
      "https://api.rajaongkir.com/starter/province",
      {
        headers: {
          key: process.env.RAJAONGKIR_API_KEY,
        },
      }
    );
    res
      .status(200)
      .json({ success: true, provinces: provinces.data.rajaongkir.results });
  } catch (error) {
    console.log(error.response?.data || error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to get provinces" });
  }
};

exports.getCities = async (req, res) => {
  try {
    const cities = await axios.get(
      `https://api.rajaongkir.com/starter/city?province=${req.query.provinceId}`,
      {
        headers: {
          key: process.env.RAJAONGKIR_API_KEY,
        },
      }
    );
    res
      .status(200)
      .json({ success: true, cities: cities.data.rajaongkir.results });
  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Failed to get cities" });
  }
};
