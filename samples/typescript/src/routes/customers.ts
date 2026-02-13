import { Router } from "express";
import { gridClient } from "../gridClient.js";
import { log } from "../log.js";

export const customerRouter = Router();

customerRouter.post("/", async (req, res) => {
  try {
    const body = req.body;
    log.incoming("POST", "/api/customers", JSON.stringify(body));

    log.gridRequest("customers.create", JSON.stringify(body));
    const customer = await gridClient.customers.create({
      CreateCustomerRequest: {
        customerType: body.customerType || "INDIVIDUAL",
        platformCustomerId: body.platformCustomerId,
        fullName: body.fullName,
        nationality: body.nationality,
        birthDate: body.birthDate,
        address: body.address,
      },
    });
    const responseJson = JSON.stringify(customer, null, 2);
    log.gridResponse("customers.create", responseJson);

    res.status(201).json(customer);
  } catch (error) {
    log.gridError("customers.create", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});
