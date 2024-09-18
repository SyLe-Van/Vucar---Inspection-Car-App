import Layout from "../components/layout";
import criteria from "../models/Criteria";
import { useState } from "react";
import dbConnect from "../utils/db";
import Create from "../components/criteria/Create";
import List from "../components/criteria/List";
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
