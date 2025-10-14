import Layout from "@/components/layout";
import Car from "@/lib/database/Car";
import Inspection from "@/lib/database/Inspection";
import dbConnect from "@/lib/database/db";
import InspectionSummary from "@/components/features/inspection";
import Head from "next/head";
export default function InspectionPage({ inspection }) {
  return (
    <Layout>
      <Head>
        <title>Vucar - Car Inspection App</title>
      </Head>
      <InspectionSummary rows={inspection} />
    </Layout>
  );
}

export async function getServerSideProps(ctx) {
  await dbConnect();

  try {
    const cars = await Car.find({}).sort({ updatedAt: -1 }).lean();

    const inspections = await Inspection.find({}).lean();

    const inspectionMap = {};
    inspections.forEach(insp => {
      inspectionMap[insp.car.toString()] = insp;
    });

    const carWithInspection = cars.map(car => {
      const inspection = inspectionMap[car._id.toString()];

      if (inspection) {
        return {
          _id: inspection._id,
          car: {
            _id: car._id,
            name: car.name,
            licensePlate: car.licensePlate,
          },
          status: car.status,
          criteries: inspection.criteries,
          createdAt: inspection.createdAt,
          updatedAt: inspection.updatedAt,
        };
      } else {
        return {
          _id: car._id,
          car: {
            _id: car._id,
            name: car.name,
            licensePlate: car.licensePlate,
          },
          status: car.status,
          criteries: [],
          createdAt: car.createdAt,
          updatedAt: car.updatedAt,
        };
      }
    });

    return {
      props: {
        inspection: JSON.parse(JSON.stringify(carWithInspection)),
      },
    };
  } catch (error) {
    console.error("Error fetching inspections:", error);
    return {
      props: {
        inspection: [],
      },
    };
  }
}
