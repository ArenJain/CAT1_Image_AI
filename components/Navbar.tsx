import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white border-b shadow-sm py-3 px-6 flex items-center justify-between">
      <div className="font-bold text-lg">
        <Link href="/">Image Extract AI</Link>
      </div>
      <div className="space-x-4">
        <Link href="/upload" className="hover:underline">Upload</Link>
        <Link href="/history" className="hover:underline">History</Link>
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <Link href="/(auth)/login" className="hover:underline">Login</Link>
      </div>
    </nav>
  );
}
