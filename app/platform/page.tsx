import { redirect } from "next/navigation";
import { platformRoutes } from "@/lib/platform-routes";

export default function PlatformPage() {
  redirect(platformRoutes.overview);
}
