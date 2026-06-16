import { loadFont as loadSerif } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";

loadSerif("normal", { weights: ["500", "600", "700"], subsets: ["latin"] });
loadSans("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
