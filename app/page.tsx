import { redirect } from "next/navigation";

/** Redirect root to the review page. */
export default function Home(): never {
  redirect("/review");
}
