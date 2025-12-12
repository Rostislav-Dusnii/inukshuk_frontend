import Header from "@components/header";
import FriendsClient from "@components/friends/FriendsClient";

export default function FriendsPage() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-5xl font-extrabold mb-8 tracking-wide">
          <span className="text-brand-orange">Frie</span>
          <span className="text-brand-green">nds</span>
        </h1>

        <FriendsClient />
      </main>
    </>
  );
}
