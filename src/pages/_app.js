import "bootstrap/dist/css/bootstrap.css";
import "../../public/css/style.css";

import { useEffect } from "react";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap");
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
// KindaCode.com