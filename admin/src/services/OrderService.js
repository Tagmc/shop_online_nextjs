const { CONFIG_MESSAGE_ERRORS } = require("../configs");
const Order = require("../models/OrderProduct");
const Product = require("../models/ProductModel");
const EmailService = require("../services/EmailService");
const { preparePaginationAndSorting, buildQuery } = require("../utils");
const mongoose = require("mongoose");

const updateProductStock = async (order) => {
  try {
    const productData = await Product.findOneAndUpdate(
      { _id: order.product, countInStock: { $gte: order.amount } },
      { $inc: { countInStock: -order.amount, sold: +order.amount } },
      { new: true }
    );

    if (productData) {
      return {
        status: CONFIG_MESSAGE_ERRORS.ACTION_SUCCESS.status,
        message: "Success",
        typeError: "",
        data: productData,
        statusMessage: "Success",
      };
    } else {
      return {
        status: CONFIG_MESSAGE_ERRORS.INVALID.status,
        message: "Error",
        typeError: "",
        statusMessage: "Error",
        id: order.product,
      };
    }
  } catch (error) {
    return {
      status: CONFIG_MESSAGE_ERRORS.INTERNAL_ERROR.status,
      message: "Error",
      typeError: "",
      statusMessage: "Error",
      id: order.product,
    };
  }
};

const createOrder = (newOrder) => {
  return new Promise(async (resolve, reject) => {
    const {
      orderItems,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      fullName,
      address,
      city,
      phone,
      user,
      isPaid,
      paidAt,
      email,
      deliveryMethod
    } = newOrder;
    try {
      const promises = newOrder.orderItems.map(updateProductStock);
      const results = await Promise.all(promises);
      const newData = results && results.filter((item) => item.id);
      if (newData.length) {
        const arrId = [];
        newData.forEach((item) => {
          arrId.push(item.id);
        });
        resolve({
          message: `The product with id: ${arrId.join(",")} out of the stock`,
          status: CONFIG_MESSAGE_ERRORS.INTERNAL_ERROR.status,
          typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
          statusMessage: "Error",
          data: null,
        });
      } else {
        const dataCreate = {
          orderItems,
          shippingAddress: {
            fullName,
            address,
            city,
            phone,
          },
          itemsPrice,
          shippingPrice,
          totalPrice,
          user: user,
          isDelivered: false,
          isPaid,
          paidAt,
        };
        if (deliveryMethod) {
          dataCreate.deliveryMethod = deliveryMethod;
        }
        if (paymentMethod) {
          dataCreate.paymentMethod = paymentMethod;
        }
        const createdOrder = await Order.create(dataCreate);
        if (createdOrder) {
          resolve({
            status: CONFIG_MESSAGE_ERRORS.ACTION_SUCCESS.status,
            message: "Success",
            typeError: "",
            data: createdOrder,
            statusMessage: "Success",
          });
        }
        // await EmailService.sendEmailCreateOrder(email, orderItems);
      }
    } catch (e) {
      //   console.log('e', e)
      reject(e);
    }
  });
};

const getOrderDetails = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkOrder = await checkOrder.findById({
        _id: id,
      });
      if (checkOrder === null) {
        resolve({
          status: CONFIG_MESSAGE_ERRORS.INVALID.status,
          message: "The product is not existed",
          typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
          data: null,
          statusMessage: "Error",
        });
      }
      resolve({
        status: CONFIG_MESSAGE_ERRORS.GET_SUCCESS.status,
        message: "Success",
        typeError: "",
        data: checkOrder,
        statusMessage: "Success",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteOrderProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkOrder = await Order.findById(id);
      if (!checkOrder) {
        resolve({
          status: CONFIG_MESSAGE_ERRORS.INVALID.status,
          message: "The product is not existed",
          typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
          data: null,
          statusMessage: "Error",
        });
      }

      const deletedOrder = await Order.findByIdAndDelete(id);
      if (!deletedOrder) {
        return resolve({
          status: "ERR",
          message: "Failed to delete order",
        });
      }

      await Promise.all(
        checkOrder.orderItems.map(async (orderItem) => {
          const product = await Product.findById(orderItem.product);
          if (product) {
            await Product.findByIdAndUpdate(orderItem.product, {
              $inc: {
                countInStock: orderItem.amount,
                sold: -orderItem.amount,
              },
            });
          }
        })
      );

      resolve({
        message: "Order deleted successfully",
        status: CONFIG_MESSAGE_ERRORS.AC.status,
        typeError: "",
        statusMessage: "Success",
        data: deletedOrder,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const updateOrder = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const existingOrder = await Order.findById(id);

      if (!existingOrder) {
        reject({
          status: CONFIG_MESSAGE_ERRORS.INVALID.status,
          message: `Order with ID ${id} not found`,
          typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
          data: null,
          statusMessage: "Error",
        });
        return;
      }

      existingOrder.orderItems = data.orderItems || existingOrder.orderItems;
      existingOrder.shippingAddress =
        data.shippingAddress || existingOrder.shippingAddress;
      existingOrder.paymentMethod =
        data.paymentMethod || existingOrder.paymentMethod;
      existingOrder.deliveryMethod =
        data.deliveryMethod || existingOrder.deliveryMethod;
      existingOrder.itemsPrice = data.itemsPrice || existingOrder.itemsPrice;
      existingOrder.shippingPrice =
        data.shippingPrice || existingOrder.shippingPrice;
      existingOrder.totalPrice = data.totalPrice || existingOrder.totalPrice;
      existingOrder.isPaid = data.isPaid || existingOrder.isPaid;
      existingOrder.paidAt = data.paidAt || existingOrder.paidAt;
      existingOrder.deliveryAt = data.deliveryAt || existingOrder.deliveryAt;

      const savedOrder = await existingOrder.save();

      resolve({
        status: CONFIG_MESSAGE_ERRORS.ACTION_SUCCESS.status,
        message: "Order updated successfully",
        typeError: "",
        data: savedOrder,
        statusMessage: "Success",
      });
    } catch (error) {
      reject(error);
    }
  });
};

const cancelOrder = (orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        resolve({
          status: CONFIG_MESSAGE_ERRORS.INVALID.status,
          message: "The Order is not existed",
          typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
          data: null,
          statusMessage: "Error",
        });
        return;
      }

      if (order.isPaid === 1) {
        resolve({
          status: CONFIG_MESSAGE_ERRORS.INVALID.status,
          message: "Cannot cancel order that has been paid",
          typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
          data: null,
          statusMessage: "Error",
        });
        return;
      }

      order.status = 3;
      await order.save();
      resolve({
        status: CONFIG_MESSAGE_ERRORS.ACTION_SUCCESS.status,
        message: "Order cancelled successfully",
        typeError: "",
        data: order,
        statusMessage: "Success",
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getAllOrder = (params) => {
  return new Promise(async (resolve, reject) => {
    try {
      const limit = params?.limit ? +params?.limit : 10;
      const search = params?.search ?? "";
      const page = params?.page ?  +params.page :  1;
      const order = params?.order ?? "created desc";
      const userId = params.userId ?? "";
      const productId = params.productId ?? "";
      const status = params.status ?? "";
      const cityId = params.cityId ?? "";

      const query = buildQuery(search);

      const { startIndex, sortOptions } = preparePaginationAndSorting(
        page,
        limit,
        order
      );

      if (userId) {
        const userIds = userId
          ?.split("|")
          .map((id) => mongoose.Types.ObjectId(id));
        query.type =
          userIds.length > 1
            ? { $in: userIds }
            : mongoose.Types.ObjectId(userId);
      }

      if (productId) {
        const productIds = productId
          ?.split("|")
          .map((id) => mongoose.Types.ObjectId(id));
        query.type =
          productIds.length > 1
            ? { $in: productIds }
            : mongoose.Types.ObjectId(productId);
      }
      if (cityId) {
        const cityIds = cityId
          ?.split("|")
          .map((id) => mongoose.Types.ObjectId(id));
        query.type =
          cityIds.length > 1
            ? { $in: cityIds }
            : mongoose.Types.ObjectId(cityId);
      }

      if (status) {
        const status = status?.split("|").map((id) => id);
        query.type = { $in: status };
      }

      const totalCount = await Order.countDocuments(query);

      const totalPage = Math.ceil(totalCount / limit);

      const fieldsToSelect = {
        status: 1,
        email: 1,
        createdAt: 1,
        updatedAt: 1,
      };

      if (page === -1 && limit === -1) {
        const allOrder = await Order.find(query)
          .sort(sortOptions)
          .select(fieldsToSelect);
        resolve({
          status: CONFIG_MESSAGE_ERRORS.GET_SUCCESS.status,
          message: "Success",
          typeError: "",
          statusMessage: "Success",
          data: {
            orders: allOrder,
            totalPage: 1,
            totalCount: totalCount,
          },
        });
        return;
      }

      const allOrder = await Order.find(query)
        .skip(startIndex)
        .limit(limit)
        .sort(sortOptions)
        .select(fieldsToSelect);
      resolve({
        status: CONFIG_MESSAGE_ERRORS.GET_SUCCESS.status,
        message: "Success",
        typeError: "",
        statusMessage: "Success",
        data: {
          orders: allOrder,
          totalPage: totalPage,
          totalCount: totalCount,
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};

// ** Me
const getAllOrderOfMe = (userId, params) => {
  return new Promise(async (resolve, reject) => {
    try {
      const limit = params?.limit ?? 10;
      const search = params?.search ?? "";
      const page = params?.page ?? 1;
      const order = params?.order ?? "created desc";
      const product = params.product ?? "";
      const status = params.status ?? "";
      const query = buildQuery(search);
      query.user = mongoose.Types.ObjectId(userId);
      const { startIndex, sortOptions } = preparePaginationAndSorting(
        page,
        limit,
        order
      );

      if (product) {
        if (Array.isArray(product)) {
          query.product = { $in: product };
        } else {
          query.product = product;
        }
      }

      if (status) {
        if (Array.isArray(status)) {
          query.status = { $in: status };
        } else {
          query.status = status;
        }
      }

      const totalCount = await Order.countDocuments(query);

      const totalPage = Math.ceil(totalCount / limit);

      const fieldsToSelect = {
        status: 1,
        email: 1,
        createdAt: 1,
        updatedAt: 1,
        user: 1,
      };
      console.log("query", {query})
      const allOrder = await Order.find(query)
        .skip(startIndex)
        .limit(limit)
        .sort(sortOptions)
        .select(fieldsToSelect);
        
      resolve({
        status: CONFIG_MESSAGE_ERRORS.GET_SUCCESS.status,
        message: "Success",
        typeError: "",
        statusMessage: "Success",
        data: {
          orders: allOrder,
          totalPage: totalPage,
          totalCount: totalCount,
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getDetailsOrderOfMe = (userId, orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      try {
        const checkOrder = await checkOrder.findById({
          _id: orderId,
        });
        if (checkOrder === null) {
          resolve({
            status: CONFIG_MESSAGE_ERRORS.INVALID.status,
            message: "The product is not existed",
            typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
            data: null,
            statusMessage: "Error",
          });
          return;
        }
        if (checkOrder.user !== userId) {
          resolve({
            status: CONFIG_MESSAGE_ERRORS.UNAUTHORIZED.status,
            message: "You no has permission",
            typeError: CONFIG_MESSAGE_ERRORS.UNAUTHORIZED.type,
            data: null,
            statusMessage: "Error",
          });
          return;
        }
        resolve({
          status: CONFIG_MESSAGE_ERRORS.GET_SUCCESS.status,
          message: "Success",
          typeError: "",
          data: checkOrder,
          statusMessage: "Success",
        });
      } catch (e) {
        reject(e);
      }
    } catch (e) {
      reject(e);
    }
  });
};

const cancelOrderOfMe = (userId, orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        resolve({
          status: CONFIG_MESSAGE_ERRORS.INVALID.status,
          message: "The Order is not existed",
          typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
          data: null,
          statusMessage: "Error",
        });
        return;
      }

      if (checkOrder.user !== userId) {
        resolve({
          status: CONFIG_MESSAGE_ERRORS.UNAUTHORIZED.status,
          message: "You no has permission",
          typeError: CONFIG_MESSAGE_ERRORS.UNAUTHORIZED.type,
          data: null,
          statusMessage: "Error",
        });
        return;
      }

      if (order.isPaid === 1) {
        resolve({
          status: CONFIG_MESSAGE_ERRORS.INVALID.status,
          message: "Cannot cancel order that has been paid",
          typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
          data: null,
          statusMessage: "Error",
        });
        return;
      }

      order.status = 3;
      await order.save();
      resolve({
        status: CONFIG_MESSAGE_ERRORS.ACTION_SUCCESS.status,
        message: "Order cancelled successfully",
        typeError: "",
        data: order,
        statusMessage: "Success",
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createOrder,
  getOrderDetails,
  deleteOrderProduct,
  getAllOrder,
  getAllOrderOfMe,
  updateOrder,
  cancelOrder,
  getDetailsOrderOfMe,
  cancelOrderOfMe,
};
