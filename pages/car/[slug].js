import Layout from "../../components/layout";
import Car from "../../models/Car";
import Criteria from "../../models/Criteria";
import dbConnect from "../../utils/db";
import CollapsibleTable from "../../components/car/table";

export default function CarItem({ car, criteries }) {
  return (
    <Layout>
      <CollapsibleTable car={car} criteries={criteries} />
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { query } = context;
  const slug = query.slug;
  await dbConnect();
  let car = await Car.findOne({ slug }).sort({ updatedAt: -1 }).lean();
  let criteries = await Criteria.find({}).sort({ updatedAt: -1 }).lean();
  let newCar = {
    _id: car._id,
    name: car.name,
    status: car.status,
  };
  return {
    props: {
      car: JSON.parse(JSON.stringify(newCar)),
      criteries: JSON.parse(JSON.stringify(criteries)),
    },
  };
}
