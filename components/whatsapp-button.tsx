import Image from "next/image";
import Link from "next/link";

export function WhatsAppButton() {
  return (
    <div className="group w-22 h-22 rounded-full fixed overflow-hidden bottom-12 right-12 flex justify-center items-center shadow-2xl transition-all duration-300 hover:transform hover:scale-125">
      <Link
        href="https://wa.me/5511984349772"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/privetime-contact.png"
          alt=""
          fill
          className="object-cover"
        ></Image>
      </Link>
    </div>
  );
}
