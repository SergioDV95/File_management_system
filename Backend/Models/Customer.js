const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  customer_id: {
    type: String,
    unique: true,
  },
});

const Customer = mongoose.model("customer", customerSchema);

const checkCustomerAndSave = async (customerData) => {
  try {
    const existingCustomer = await Customer.findOne({
      email: customerData.email,
    });
    if (existingCustomer) {
      return existingCustomer;
    } else {
      const newCustomer = new Customer(customerData);
      await newCustomer.save();
      return newCustomer;
    }
  } catch (error) {
    console.error("Error saving customer:", error);
    throw error;
  }
};

module.exports = Customer;
