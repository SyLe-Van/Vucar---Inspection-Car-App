import { Inter } from "next/font/google";
import "../styles/globals.scss";
import { Provider } from "react-redux";
import store from "../store";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import Head from "next/head";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/base.scss";

let presistor = persistStore(store);
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  Component,
  pageProps: { session, ...pageProps },
}) {
  <Head>
    <title>Vucar Inspecion Criteria Car</title>
  </Head>;
  return (
    <SessionProvider session={session}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={presistor}>
          <PayPalScriptProvider deferLoading={true}>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
            <Component {...pageProps} />
          </PayPalScriptProvider>
        </PersistGate>
      </Provider>
    </SessionProvider>
  );
}
