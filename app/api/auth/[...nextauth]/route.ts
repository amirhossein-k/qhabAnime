// app/api/auth/[...nextauth]/route.ts - ✅ این فایل حیاتیه!

import { handlers } from "@/app/models/lib/auth";

export const { GET, POST } = handlers
