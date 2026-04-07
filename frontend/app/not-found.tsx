import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto py-20 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="text-teal-600 hover:text-teal-800 font-medium">
        Go back home
      </Link>
    </div>
  );
}
