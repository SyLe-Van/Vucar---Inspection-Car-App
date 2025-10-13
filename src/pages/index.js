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
        <title>Vucar-Inspection Car</title>
      </Head>
      <InspectionSummary rows={inspection} />
    </Layout>
  );
}

export async function getServerSideProps(ctx) {
  await dbConnect();

  try {
    const inspection = await Inspection.find({})
      .populate({ path: "car", model: Car, select: "name" })
      .sort({ createdAt: -1 })
      .lean();

    return {
      props: {
        inspection: JSON.parse(JSON.stringify(inspection)),
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
