import Layout from "@/components/layout";
import criteria from "@/lib/database/Criteria";
import { useState } from "react";
import dbConnect from "@/lib/database/db";
import Create from "@/components/features/criteria/Create";
import List from "@/components/features/criteria/List";
export default function Criteria({ criteries }) {
  const [data, setData] = useState(criteries);

  return (
    <Layout>
      <div>
        <Create setCriteries={setData} />
        <List criteries={data} setCriteries={setData} />
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  await dbConnect();
  const criteries = await criteria.find({}).sort({ updatedAt: -1 }).lean();
  return {
    props: {
      criteries: JSON.parse(JSON.stringify(criteries)),
    },
  };
}
