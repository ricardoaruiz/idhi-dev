import type { V2_MetaFunction } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node"
import { getLoggedUser } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  await getLoggedUser(request)
  return {}
};

export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix App" }];
};

export default function Index() {
  return (
    <div>IHDI</div>
  );
}
