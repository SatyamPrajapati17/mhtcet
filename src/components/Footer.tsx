import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">
              CETCounsel AI &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/predict" className="hover:text-gray-700 transition-colors">
              Predict
            </Link>
            <Link href="/colleges" className="hover:text-gray-700 transition-colors">
              Colleges
            </Link>
            <Link href="/compare" className="hover:text-gray-700 transition-colors">
              Compare
            </Link>
            </div>
        </div>
      </div>
    </footer>
  );
}
