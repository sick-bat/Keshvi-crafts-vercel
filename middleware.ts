import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method === "POST" && pathname.replace(/\/$/, "") === "/checkout/success") {
    const url = request.nextUrl.clone();
    url.pathname = "/api/payu/response";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout/success", "/checkout/success/"],
};
