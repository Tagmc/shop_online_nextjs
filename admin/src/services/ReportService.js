const { CONFIG_MESSAGE_ERRORS } = require("../configs");
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");
const Order = require("../models/OrderProduct");
const Review = require("../models/ReviewModel");

const getReportCountProductType = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const pipeline = [
        {
          $group: {
            _id: {
              type: "$type",
              status: "$status",
            },
            typeName: { $first: "$type.name" },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.type",
            counts: {
              $push: {
                k: { $toString: "$_id.status" },
                v: {
                  count: "$count",
                },
              },
            },
            total: { $sum: "$count" },
          },
        },
        {
          $project: {
            _id: 0,
            typeName: "$_id",
            counts: {
              $arrayToObject: "$counts",
            },
            total: 1,
          },
        },
      ];

      const productCountByTypeAndStatus = await Product.aggregate(pipeline);

      resolve({
        status: CONFIG_MESSAGE_ERRORS.GET_SUCCESS.status,
        message: "Success",
        typeError: "",
        statusMessage: "Success",
        data: productCountByTypeAndStatus,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getReportCountRecords = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const userCount = await User.countDocuments();
      const productCount = await Product.countDocuments();
      const orderCount = await Order.countDocuments();
      const reviewCount = await Review.countDocuments();

      resolve({
        status: CONFIG_MESSAGE_ERRORS.GET_SUCCESS.status,
        message: "Success",
        typeError: "",
        statusMessage: "Success",
        data: {
          user: userCount,
          product: productCount,
          order: orderCount,
          review: reviewCount,
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  getReportCountProductType,
  getReportCountRecords
};
