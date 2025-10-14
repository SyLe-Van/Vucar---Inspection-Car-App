import Layout from "@/components/layout";
import Car from "@/lib/database/Car";
import Criteria from "@/lib/database/Criteria";
import dbConnect from "@/lib/database/db";
import CollapsibleTable from "@/components/features/car/table";

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
  const car = await Car.findOne({ slug }).sort({ updatedAt: -1 }).lean();
  const criteries = await Criteria.find({}).sort({ updatedAt: -1 }).lean();
  const newCar = {
    _id: car._id,
    name: car.name,
    licensePlate: car.licensePlate,
    status: car.status,
  };
  return {
    props: {
      car: JSON.parse(JSON.stringify(newCar)),
      criteries: JSON.parse(JSON.stringify(criteries)),
    },
  };
}
