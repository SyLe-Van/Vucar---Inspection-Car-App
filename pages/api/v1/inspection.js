import { createRouter } from "next-connect";
import dbConnect from "../../../utils/db";

import Criteria from "../../../models/Criteria";
import Car from "../../../models/Car";
import Inspection from "../../../models/Inspection";
import slugify from "slugify";

const router = createRouter();

router.post(async (req, res) => {
  try {
    const { car_id, status, criteries } = req.body;

    await dbConnect();
    const existingCar = await Car.findById(car_id);
    if (!existingCar) {
      return res.status(400).json({ message: "Car not found." });
    }

    for (let i = 0; i < criteries.length; i++) {
      const existingCriteria = await Criteria.findById(
        criteries[i].criteria_id
      );
      if (!existingCriteria) {
        return res.status(400).json({
          message: `Criteria with ID ${criteries[i].criteria_id} not found.`,
        });
      }
    }

    const newInspection = new Inspection({
      car: car_id,
      criteries,
      status: status || 0,
    });
    console.log("New Inspection", newInspection);
    await newInspection.save();
    const inspections = await Inspection.find({}).sort({ createdAt: -1 });

    res.json({
      message: "Inspection has been created successfully.",
      inspections,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get(async (req, res) => {
  try {
    const { carId } = req.query;

    console.log("Car ID", carId);
    await dbConnect();
    const inspection = await Inspection.findOne({ car: carId }).populate(
      "criteries.criteria_id"
    );
    if (!inspection) {
      return res
        .status(404)
        .json({ message: "Inspection not found for this car." });
    }
    res.json({
      message: "Inspection found.",
      inspection,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete(async (req, res) => {
  try {
    const { car_id } = req.body;

    await dbConnect();

    const result = await Inspection.deleteMany({ car: car_id });

    res.json({
      message: `Successfully deleted ${result.deletedCount} inspections.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
export default router.handler();
