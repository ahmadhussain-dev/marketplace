
import { registerController } from "@/modules/auth/auth.controller";
import { rejectCrossOrigin } from "@/lib/auth/origin";

// export const runtime = "nodejs";

export async function POST(request) {
  const rejected = rejectCrossOrigin(request);
  if(rejected) return rejected;

  return registerController(request);
}
