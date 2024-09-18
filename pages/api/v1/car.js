import { createRouter } from "next-connect";

import Car from "../../../models/Car";
import slugify from "slugify";
import dbConnect from "../../../utils/db";
const router = createRouter();

router.post(async (req, res) => {
  try {
    await dbConnect();
    const { name, status } = req.body;

    const existingCar = await Car.findOne({ name });
    if (existingCar) {
      return res
        .status(400)
        .json({ message: "Car already exists, try a different name" });
    }

    const newCar = new Car({ name, status, slug: slugify(name) });
    await newCar.save();
    const car = await Car.find({}).sort({ createdAt: -1 });
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
      cars: await Car.find({}).sort({ updatedAt: -1 }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.put(async (req, res) => {
  try {
    const { id, name } = req.body;
    await dbConnect();
    await Car.findByIdAndUpdate(id, { name });
    return res.json({
      message: "Car has been updated successfuly",
      cars: await Car.find({}).sort({ createdAt: -1 }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get(async (req, res) => {
  try {
    await dbConnect();
    const cars = await Car.find({}, "name", "status");
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
export default router.handler();
