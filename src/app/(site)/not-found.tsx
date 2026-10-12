import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="bg-paper py-28 md:py-40">
      <div className="container-x max-w-2xl text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 text-5xl md:text-6xl">This page has moved or no longer exists.</h1>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href="/">Back to home</Button>
          <Button href="/contact" variant="outline" arrow={false}>
            Contact Anthony
          </Button>
        </div>
      </div>
    </section>
  );
}
