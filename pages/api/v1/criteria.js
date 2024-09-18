import { createRouter } from "next-connect"; // Check if this is correctly imported
import dbConnect from "../../../utils/db";

import Criteria from "../../../models/Criteria";
import slugify from "slugify";

const router = createRouter();

router.post(async (req, res) => {
  try {
    const { name, description } = req.body;
    await dbConnect();

    const existingCriteria = await Criteria.findOne({ name });
    if (existingCriteria) {
      return res
        .status(400)
        .json({ message: "Criteria already exists, try a different name." });
    }

    const newCriteria = new Criteria({
      name,
      description,
      slug: slugify(name),
    });
    await newCriteria.save();

    const criteries = await Criteria.find({}).sort({ createdAt: -1 });

    res.json({
      message: `Criteria ${name} has been created successfully.`,
      criteries,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete(async (req, res) => {
  try {
    const { id } = req.body;
    await dbConnect();
    await Criteria.deleteOne({ _id: id });

    return res.json({
      message: "Criteria has been deleted successfuly",
      criteries: await Criteria.find({}).sort({ updatedAt: -1 }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put(async (req, res) => {
  try {
    const { id, name, description } = req.body;
    await dbConnect();
    await Criteria.findByIdAndUpdate(id, {
      name,
      description,
    });

    return res.json({
      message: "Criteria has been updated successfuly",
      criteries: await Criteria.find({}).sort({ createdAt: -1 }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router.handler();
