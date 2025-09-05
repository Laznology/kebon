"use client"
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {Button} from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex items-center bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center justify-center">
          <div className="flex justify-center ">
            <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-md overflow-hidden shadow-sm">
              <Image
                src="/Kebon%20Webp.webp"
                alt="Logo digital garden — daun dan pena"
                width={800}
                height={800}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          </div>

          <div>
            <article className="prose prose-lg max-w-none">
              <h1>Digital Garden</h1>
              <p className="lead">
                Koleksi catatan, eksperimen, dan pemikiran yang tumbuh dari waktu ke waktu —
                bukan artikel publish-once, melainkan sesuatu yang terus dirawat.
              </p>
              <blockquote>
                Tbh, I still have no idea with this quote yet :3
                <footer className="mt-0 text-right text-sm text-slate-500">
                  — Pemilik Kebun
                </footer>
              </blockquote>

              <div className="flex gap-4 justify-center items-center">
                <Link
                  href="/introduction"
                  className="inline-block rounded-md px-5 py-2 text-sm font-medium no-underline bg-slate-900 text-white hover:opacity-90"
                >
                  Soon
                </Link>
                  <Button onClick={ () => signOut()}>Sign Out</Button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
