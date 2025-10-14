import { createRouter } from "next-connect";

import Car from "@/lib/database/Car";
import slugify from "slugify";
import dbConnect from "@/lib/database/db";
const router = createRouter();

router.post(async (req, res) => {
  try {
    await dbConnect();
    const { name, licensePlate, status } = req.body;

    // Validation: Bắt buộc phải có licensePlate
    if (!licensePlate || licensePlate.trim() === "") {
      return res.status(400).json({ message: "License plate is required" });
    }

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Car name is required" });
    }

    if (status === undefined || status === null) {
      return res.status(400).json({ message: "Status is required" });
    }

    const existingCar = await Car.findOne({
      $or: [{ name }, { licensePlate: licensePlate?.toUpperCase() }],
    });

    if (existingCar) {
      if (existingCar.name === name) {
        return res
          .status(400)
          .json({ message: "Car name already exists, try a different name" });
      }
      if (existingCar.licensePlate === licensePlate?.toUpperCase()) {
        return res
          .status(400)
          .json({ message: "License plate already exists" });
      }
    }

    const newCar = new Car({
      name,
      licensePlate: licensePlate.toUpperCase().trim(),
      status,
      slug: slugify(name),
    });
    await newCar.save();
    const car = await Car.find({})
      .select("name licensePlate status slug")
      .sort({ createdAt: -1 });
    res.json({
      message: `${name} has been created successfully.`,
      car,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete(async (req, res) => {
  try {
    const { id } = req.body;
    await dbConnect();
    await Car.deleteOne({ _id: id });
    return res.json({
      message: "Car has been deleted successfuly",
      cars: await Car.find({})
        .select("name licensePlate status slug")
        .sort({ updatedAt: -1 }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.put(async (req, res) => {
  try {
    const { id, name, licensePlate } = req.body;
    await dbConnect();

    const updateData = { name };
    if (licensePlate) {
      updateData.licensePlate = licensePlate.toUpperCase().trim();
    }

    await Car.findByIdAndUpdate(id, updateData);
    return res.json({
      message: "Car has been updated successfuly",
      cars: await Car.find({})
        .select("name licensePlate status slug")
        .sort({ createdAt: -1 }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get(async (req, res) => {
  try {
    await dbConnect();
    const cars = await Car.find({})
      .select("name licensePlate status slug")
      .sort({ createdAt: -1 });
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
export default router.handler();
