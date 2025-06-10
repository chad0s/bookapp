"use client";

import { useParams } from "next/navigation";
import BookForm from "@/components/BookForm";

export default function EditBookPage() {
  const params = useParams();
  const bookId = params.id as string;

  return <BookForm bookId={bookId} isEdit={true} />;
}
