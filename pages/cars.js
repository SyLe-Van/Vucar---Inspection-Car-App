import Layout from "../components/layout";
import car from "../models/Car";
import { useState } from "react";
import Create from "../components/car/Create";
import List from "../components/car/List";
import dbConnect from "../utils/db";
export default function Car({ cars }) {
  const [data, setData] = useState(cars);

  return (
    <Layout>
      <div>
        <Create setCars={setData} />
        <List cars={data} setCars={setData} />
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  await dbConnect();
  const cars = await car.find({}).sort({ updatedAt: -1 }).lean();
  return {
    props: {
      cars: JSON.parse(JSON.stringify(cars)),
    },
  };
}
